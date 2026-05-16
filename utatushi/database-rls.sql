-- Secure RLS Setup v2 - Simple and working
-- Run in Supabase SQL Editor

-- 1. Clean old
DROP POLICY IF EXISTS "public_tables_read" ON public.tables;
DROP POLICY IF EXISTS "public_profiles_read" ON public.profiles;
DROP POLICY IF EXISTS "auth_profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "auth_profiles_update" ON public.profiles;
DROP POLICY IF EXISTS "public_bookings_read" ON public.bookings;
DROP POLICY IF EXISTS "auth_bookings_insert" ON public.bookings;
DROP POLICY IF EXISTS "auth_bookings_update" ON public.bookings;

-- 2. Enable RLS fresh
ALTER TABLE public.tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;

ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- 3. Tables: anyone can read active
CREATE POLICY "tables_read" ON public.tables FOR SELECT USING (status = 'active');

-- 4. Profiles: check auth.uid matches id
CREATE POLICY "profiles_read" ON public.profiles FOR SELECT TO authenticated 
    USING (auth.uid() = id);

CREATE POLICY "profiles_insert" ON public.profiles FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON public.profiles FOR UPDATE TO authenticated 
    USING (auth.uid() = id);

-- 5. Bookings: anyone can read, users can insert/update own
CREATE POLICY "bookings_read" ON public.bookings FOR SELECT USING (true);

CREATE POLICY "bookings_insert" ON public.bookings FOR INSERT TO authenticated 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "bookings_update" ON public.bookings FOR UPDATE TO authenticated 
    USING (auth.uid() = user_id);

-- 6. Grants
GRANT SELECT ON public.tables TO anon, authenticated;
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;
GRANT SELECT ON public.bookings TO anon, authenticated;
GRANT SELECT, INSERT ON public.bookings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.bookings TO authenticated;