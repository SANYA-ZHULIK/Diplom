-- Безопасность для продакшена
-- Выполнить в Supabase SQL Editor

-- Отключаем RLS (проблемы с Supabase)
ALTER TABLE public.tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;