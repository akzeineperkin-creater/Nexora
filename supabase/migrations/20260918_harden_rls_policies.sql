-- =============================================================================
-- MIGRATION: Harden Supabase Row-Level Security (RLS) Policies Against IDOR
-- Project: Nexora Platform
-- Date: 2026-09-18
-- Description:
--   1. Enforces strict row ownership (auth.uid() = user_id) on all personal tables:
--      portfolios, holdings, transactions, watchlists, notifications.
--   2. Prevents IDOR by removing overly permissive SELECT (true) on portfolios.
--   3. Secures write operations (INSERT, UPDATE, DELETE) with WITH CHECK (auth.uid() = user_id).
--   4. Provides a secure function for leaderboard rankings without exposing raw portfolios.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. PROFILES TABLE
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Public read for usernames, avatars, levels (required for social features & leaderboard)
CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

-- Users can only insert their own profile row
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Users can only update their own profile
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- -----------------------------------------------------------------------------
-- 2. PORTFOLIOS TABLE (CRITICAL IDOR FIX)
-- -----------------------------------------------------------------------------
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Portfolios are viewable by everyone for leaderboard" ON public.portfolios;
DROP POLICY IF EXISTS "Users can view own portfolio" ON public.portfolios;
DROP POLICY IF EXISTS "Portfolios viewable by authenticated users" ON public.portfolios;
DROP POLICY IF EXISTS "Users can insert own portfolio" ON public.portfolios;
DROP POLICY IF EXISTS "Users can update own portfolio" ON public.portfolios;
DROP POLICY IF EXISTS "Users can delete own portfolio" ON public.portfolios;

-- Users can ONLY select their own portfolio record
CREATE POLICY "Users can view own portfolio"
ON public.portfolios
FOR SELECT
USING (auth.uid() = user_id);

-- Users can ONLY insert a portfolio belonging to themselves
CREATE POLICY "Users can insert own portfolio"
ON public.portfolios
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can ONLY update their own portfolio
CREATE POLICY "Users can update own portfolio"
ON public.portfolios
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can ONLY delete their own portfolio
CREATE POLICY "Users can delete own portfolio"
ON public.portfolios
FOR DELETE
USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 3. HOLDINGS TABLE
-- -----------------------------------------------------------------------------
ALTER TABLE public.holdings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own holdings" ON public.holdings;
DROP POLICY IF EXISTS "Users can insert own holdings" ON public.holdings;
DROP POLICY IF EXISTS "Users can update own holdings" ON public.holdings;
DROP POLICY IF EXISTS "Users can delete own holdings" ON public.holdings;

CREATE POLICY "Users can view own holdings"
ON public.holdings
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.portfolios p
    WHERE p.id = holdings.portfolio_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own holdings"
ON public.holdings
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.portfolios p
    WHERE p.id = holdings.portfolio_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update own holdings"
ON public.holdings
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.portfolios p
    WHERE p.id = holdings.portfolio_id AND p.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.portfolios p
    WHERE p.id = holdings.portfolio_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete own holdings"
ON public.holdings
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.portfolios p
    WHERE p.id = holdings.portfolio_id AND p.user_id = auth.uid()
  )
);

-- -----------------------------------------------------------------------------
-- 4. TRANSACTIONS TABLE
-- -----------------------------------------------------------------------------
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;

CREATE POLICY "Users can view own transactions"
ON public.transactions
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.portfolios p
    WHERE p.id = transactions.portfolio_id AND p.user_id = auth.uid()
  )
);

CREATE POLICY "Users can insert own transactions"
ON public.transactions
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.portfolios p
    WHERE p.id = transactions.portfolio_id AND p.user_id = auth.uid()
  )
);

-- -----------------------------------------------------------------------------
-- 5. WATCHLISTS TABLE
-- -----------------------------------------------------------------------------
ALTER TABLE public.watchlists ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own watchlist" ON public.watchlists;
DROP POLICY IF EXISTS "Users can insert own watchlist" ON public.watchlists;
DROP POLICY IF EXISTS "Users can delete own watchlist" ON public.watchlists;

CREATE POLICY "Users can view own watchlist"
ON public.watchlists
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own watchlist"
ON public.watchlists
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own watchlist"
ON public.watchlists
FOR DELETE
USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 6. NOTIFICATIONS TABLE
-- -----------------------------------------------------------------------------
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 7. CHALLENGE PARTICIPANTS TABLE
-- -----------------------------------------------------------------------------
ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Challenge participants are viewable by everyone" ON public.challenge_participants;
DROP POLICY IF EXISTS "Users can join challenge" ON public.challenge_participants;
DROP POLICY IF EXISTS "Users can update own challenge participation" ON public.challenge_participants;
DROP POLICY IF EXISTS "Users can leave challenge" ON public.challenge_participants;

CREATE POLICY "Challenge participants are viewable by everyone"
ON public.challenge_participants
FOR SELECT
USING (true);

CREATE POLICY "Users can join challenge"
ON public.challenge_participants
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own challenge participation"
ON public.challenge_participants
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave challenge"
ON public.challenge_participants
FOR DELETE
USING (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- 8. SECURE LEADERBOARD FUNCTION (SECURITY DEFINER)
-- Allows computing leaderboard standings safely without exposing raw portfolios
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_public_leaderboard(result_limit INT DEFAULT 100)
RETURNS TABLE (
  user_id UUID,
  username TEXT,
  avatar_url TEXT,
  level INT,
  cash NUMERIC,
  starting_cash NUMERIC,
  return_pct NUMERIC,
  rank INT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    p.id AS user_id,
    COALESCE(p.username, p.full_name, 'Trader') AS username,
    p.avatar_url,
    p.level,
    COALESCE(port.cash, 10000.00)::NUMERIC AS cash,
    COALESCE(port.starting_cash, 10000.00)::NUMERIC AS starting_cash,
    ROUND(
      (((COALESCE(port.cash, 10000.00) - COALESCE(port.starting_cash, 10000.00)) / NULLIF(COALESCE(port.starting_cash, 10000.00), 0)) * 100)::NUMERIC,
      2
    ) AS return_pct,
    DENSE_RANK() OVER (
      ORDER BY (((COALESCE(port.cash, 10000.00) - COALESCE(port.starting_cash, 10000.00)) / NULLIF(COALESCE(port.starting_cash, 10000.00), 0)) * 100) DESC
    )::INT AS rank
  FROM public.profiles p
  LEFT JOIN public.portfolios port ON p.id = port.user_id
  ORDER BY return_pct DESC
  LIMIT result_limit;
$$;
