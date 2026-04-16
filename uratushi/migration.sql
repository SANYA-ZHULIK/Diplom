-- Database Migration for min_guests feature
-- Run this in Supabase SQL Editor

-- Add min_guests column to tables (if not exists)
ALTER TABLE public.tables ADD COLUMN IF NOT EXISTS min_guests INTEGER DEFAULT 1;

-- Set default min_guests for existing tables (where null)
UPDATE public.tables SET min_guests = 1 WHERE min_guests IS NULL;

-- Add guest_count to bookings (REQUIRED for booking to work)
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS guest_count INTEGER DEFAULT 2;