-- ============================================================
-- AUTHENTICATION & AUTHORIZATION MIGRATION
-- Adds user profiles with admin role, RLS policies, and updates
-- ============================================================

-- 1. Create profiles table (extends auth.users from Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    full_name TEXT,
    phone TEXT,
    is_admin BOOLEAN DEFAULT false NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 2. Create function to automatically create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, is_admin)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name', false);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Create trigger to call handle_new_user on auth.users insert
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Update bookings table to add user_id foreign key
ALTER TABLE bookings 
    ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL;

-- 5. Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;

-- 6. Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 7. Policies for profiles
-- Users can view their own profile
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
CREATE POLICY "Users can view own profile" 
    ON profiles FOR SELECT 
    USING (auth.uid() = id);

-- Users can update their own profile
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" 
    ON profiles FOR UPDATE 
    USING (auth.uid() = id);

-- Admin can view any profile (optional)
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
    ON profiles FOR SELECT
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- 8. Enable RLS on tables (for admin management, public read)
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

-- Public read access to tables
DROP POLICY IF EXISTS "Public read tables" ON tables;
CREATE POLICY "Public read tables"
    ON tables FOR SELECT
    USING (true);

-- Admin can update tables
DROP POLICY IF EXISTS "Admin update tables" ON tables;
CREATE POLICY "Admin update tables"
    ON tables FOR UPDATE
    USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true));

-- 9. Enable RLS on bookings with comprehensive policies
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- Users can view their own bookings OR admins can view all
DROP POLICY IF EXISTS "Users view own bookings" ON bookings;
CREATE POLICY "Users view own bookings"
    ON bookings FOR SELECT
    USING (
        auth.uid() = user_id OR
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Insert: allow guests (anon with null user_id) or authenticated owners or admins
DROP POLICY IF EXISTS "Users insert bookings" ON bookings;
CREATE POLICY "Users insert bookings"
    ON bookings FOR INSERT
    WITH CHECK (
        (auth.role() = 'anon' AND user_id IS NULL) OR
        (auth.uid() = user_id) OR
        (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
    );

-- Update: only admins can update existing bookings
DROP POLICY IF EXISTS "Admin update bookings" ON bookings;
CREATE POLICY "Admin update bookings"
    ON bookings FOR UPDATE
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    )
    WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- Delete: only admins can delete bookings
DROP POLICY IF EXISTS "Admin delete bookings" ON bookings;
CREATE POLICY "Admin delete bookings"
    ON bookings FOR DELETE
    USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- 10. Create view for user booking history (convenient for queries)
CREATE OR REPLACE VIEW public.user_bookings_view AS
SELECT 
    b.*,
    t.number as table_number,
    t.seats as table_seats,
    t.zone_name
FROM bookings b
LEFT JOIN tables t ON b.table_id = t.id
ORDER BY b.date DESC, b.time_slot DESC;

-- 11. Helper function to check admin status (optional, can be used in future policies)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND is_admin = true);
$$ LANGUAGE sql STABLE;
