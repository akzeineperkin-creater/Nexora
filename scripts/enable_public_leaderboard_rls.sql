-- =============================================================================
-- MIGRATION: Harden RLS Policies for Profiles, Portfolios & Leaderboard
-- Project: Nexra Platform (Supabase PostgreSQL)
-- Description: Secures portfolios to auth.uid() = user_id to prevent IDOR
--              while keeping public profiles viewable for leaderboard ranking.
-- =============================================================================

-- 1. Profiles Table: Allow public read of usernames, avatars, levels
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

CREATE POLICY "Profiles are viewable by everyone"
ON public.profiles
FOR SELECT
USING (true);

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- 2. Portfolios Table: Strict ownership enforcement (PREVENTS IDOR)
ALTER TABLE public.portfolios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Portfolios are viewable by everyone for leaderboard" ON public.portfolios;
DROP POLICY IF EXISTS "Users can view own portfolio" ON public.portfolios;
DROP POLICY IF EXISTS "Portfolios viewable by authenticated users" ON public.portfolios;
DROP POLICY IF EXISTS "Users can insert own portfolio" ON public.portfolios;
DROP POLICY IF EXISTS "Users can update own portfolio" ON public.portfolios;
DROP POLICY IF EXISTS "Users can delete own portfolio" ON public.portfolios;

CREATE POLICY "Users can view own portfolio"
ON public.portfolios
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own portfolio"
ON public.portfolios
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own portfolio"
ON public.portfolios
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own portfolio"
ON public.portfolios
FOR DELETE
USING (auth.uid() = user_id);

-- 3. Challenges & Challenge Participants Tables
ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Challenges are viewable by everyone" ON public.challenges;
CREATE POLICY "Challenges are viewable by everyone" ON public.challenges FOR SELECT USING (true);

ALTER TABLE public.challenge_participants ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Challenge participants are viewable by everyone" ON public.challenge_participants;
CREATE POLICY "Challenge participants are viewable by everyone" ON public.challenge_participants FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can join challenge" ON public.challenge_participants;
CREATE POLICY "Users can join challenge" ON public.challenge_participants FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own challenge participation" ON public.challenge_participants;
CREATE POLICY "Users can update own challenge participation" ON public.challenge_participants FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can leave challenge" ON public.challenge_participants;
CREATE POLICY "Users can leave challenge" ON public.challenge_participants FOR DELETE USING (auth.uid() = user_id);
