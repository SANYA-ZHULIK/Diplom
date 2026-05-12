-- Disable RLS on profiles (no policies needed)
-- This allows all queries without restrictions
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Optional: Also disable RLS on bookings if you want unrestricted access
-- But bookings already have no policies, so it's fine
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;

-- Ensure your admin user has is_admin = true
-- Replace email with your admin's email
UPDATE profiles 
SET is_admin = true 
WHERE email = 'admin@example.com';
