-- =============================================================================
-- MIGRATION: Enable Public RLS Read Policies for Leaderboard & Profiles
-- Project: Nexra Platform (Supabase PostgreSQL)
-- Description: Allows reading public non-sensitive profile & portfolio data
--              so all registered users appear on the Leaderboard.
-- =============================================================================

-- 1. Profiles Table: Allow public read of usernames, avatars, levels
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

-- 2. Portfolios Table: Allow public read of virtual balances for leaderboard
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Portfolios are viewable by everyone for leaderboard" ON public.portfolios;
DROP POLICY IF EXISTS "Users can view own portfolio" ON public.portfolios;
DROP POLICY IF EXISTS "Portfolios viewable by authenticated users" ON public.portfolios;

CREATE POLICY "Portfolios are viewable by everyone for leaderboard"
ON public.portfolios
FOR SELECT
USING (true);

-- 3. Challenges & Challenge Participants Tables: Allow public read for tournaments
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Challenges are viewable by everyone" ON public.challenges;

CREATE POLICY "Challenges are viewable by everyone"
ON public.challenges
FOR SELECT
USING (true);

ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Challenge participants are viewable by everyone" ON public.challenge_participants;

CREATE POLICY "Challenge participants are viewable by everyone"
ON public.challenge_participants
FOR SELECT
USING (true);
