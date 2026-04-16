-- Database Setup with RLS Policies
-- Run this in Supabase SQL Editor

-- ============================================
-- TABLES: Enable RLS
-- ============================================
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;

-- Anyone can view active tables
DROP POLICY IF EXISTS "Anyone can view tables" ON public.tables;
CREATE POLICY "Anyone can view tables" ON public.tables FOR SELECT USING (status = 'active');

-- Only admins can insert/update/delete tables
DROP POLICY IF EXISTS "Admins can manage tables" ON public.tables;
CREATE POLICY "Admins can manage tables" ON public.tables FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- ============================================
-- PROFILES: Enable RLS
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read own profile
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);

-- Users can insert own profile
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Users can update own profile
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Admins can read all profiles
DROP POLICY IF EXISTS "Admins can read all profiles" ON public.profiles;
CREATE POLICY "Admins can read all profiles" ON public.profiles FOR SELECT USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- ============================================
-- BOOKINGS: Enable RLS
-- ============================================
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Anyone can view bookings (filtered in app by table_id or user_id)
DROP POLICY IF EXISTS "Anyone can view bookings" ON public.bookings;
CREATE POLICY "Anyone can view bookings" ON public.bookings FOR SELECT USING (true);

-- Authenticated users can create bookings
DROP POLICY IF EXISTS "Users can create bookings" ON public.bookings;
CREATE POLICY "Users can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update own bookings (cancel)
DROP POLICY IF EXISTS "Users can update own bookings" ON public.bookings;
CREATE POLICY "Users can update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = user_id);

-- Admins can manage all bookings
DROP POLICY IF EXISTS "Admins can manage bookings" ON public.bookings;
CREATE POLICY "Admins can manage bookings" ON public.bookings FOR ALL USING (
    auth.uid() IN (SELECT id FROM public.profiles WHERE role = 'admin')
);

-- ============================================
-- ANONYMOUS USERS (for public access)
-- ============================================

-- Allow anonymous access to tables for booking page
DROP POLICY IF EXISTS "service_role can manage tables" ON public.tables;
CREATE POLICY "service_role can manage tables" ON public.tables FOR ALL USING (
    current_setting('request.jwt.claim', true) = 'true'
);

-- ============================================
-- CREATE INDEXES for performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON public.bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_table_id ON public.bookings(table_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON public.bookings(booking_date);

-- ============================================
-- MAKE TABLES PUBLICLY READABLE (alternative approach)
-- ============================================

-- Grant public read access to tables
GRANT SELECT ON public.tables TO anon;
GRANT SELECT ON public.tables TO authenticated;

-- For bookings: grant insert for authenticated, select for all
GRANT SELECT, INSERT ON public.bookings TO anon;
GRANT SELECT, INSERT, UPDATE ON public.bookings TO authenticated;

-- For profiles: grant access
GRANT SELECT, INSERT, UPDATE ON public.profiles TO authenticated;