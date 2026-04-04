-- Схема базы данных для приложения "У Ратуши"
-- Запустите этот скрипт в SQL Editor Supabase

-- ============================================
-- ТАБЛИЦЫ
-- ============================================

-- Столики
CREATE TABLE IF NOT EXISTS tables (
    id SERIAL PRIMARY KEY,
    table_number INTEGER NOT NULL UNIQUE,
    seats INTEGER NOT NULL DEFAULT 2,
    position_x INTEGER NOT NULL DEFAULT 50,
    position_y INTEGER NOT NULL DEFAULT 50,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Бронирования
CREATE TABLE IF NOT EXISTS bookings (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    table_id INTEGER NOT NULL REFERENCES tables(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration INTEGER NOT NULL DEFAULT 2,
    guest_name VARCHAR(255) NOT NULL,
    guest_phone VARCHAR(20) NOT NULL,
    notes TEXT,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- История бонусов
CREATE TABLE IF NOT EXISTS bonus_history (
    id SERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    amount INTEGER NOT NULL,
    reason VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- ПРОФИЛИ ПОЛЬЗОВАТЕЛЕЙ
-- ============================================

-- Создаем таблицу профилей если она не существует
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255),
    phone VARCHAR(20),
    role VARCHAR(20) DEFAULT 'user',
    bonus_balance INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Функция для автоматического создания профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, role)
    VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name', 'user');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для создания профиля
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- ФУНКЦИИ ДЛЯ БОНУСОВ
-- ============================================

-- Функция для добавления бонусных баллов
CREATE OR REPLACE FUNCTION public.add_bonus_points(user_id UUID, points INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET bonus_balance = bonus_balance + points,
        updated_at = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для обновления баланса (с проверкой)
CREATE OR REPLACE FUNCTION public.update_bonus_balance(user_id UUID, points INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET bonus_balance = GREATEST(0, bonus_balance + points),
        updated_at = NOW()
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- RLS ПОЛИТИКИ (Row Level Security)
-- ============================================

-- Включаем RLS для всех таблиц
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE bonus_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Политики для таблицы tables
CREATE POLICY "Tables viewable by everyone" ON tables
    FOR SELECT USING (true);

CREATE POLICY "Tables editable by admin" ON tables
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Политики для таблицы bookings
CREATE POLICY "Users can view own bookings" ON bookings
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all bookings" ON bookings
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Users can create own bookings" ON bookings
    FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own bookings" ON bookings
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins can update all bookings" ON bookings
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Политики для таблицы bonus_history
CREATE POLICY "Users can view own bonus history" ON bonus_history
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Admins can view all bonus history" ON bonus_history
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can create bonus records" ON bonus_history
    FOR INSERT WITH CHECK (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Политики для таблицы profiles
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Admins can update all profiles" ON profiles
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- ============================================
-- ТЕСТОВЫЕ ДАННЫЕ
-- ============================================

-- Добавляем тестовые столики
INSERT INTO tables (table_number, seats, position_x, position_y, status) VALUES
(1, 2, 15, 20, 'active'),
(2, 2, 15, 40, 'active'),
(3, 4, 15, 60, 'active'),
(4, 4, 15, 80, 'active'),
(5, 6, 40, 30, 'active'),
(6, 6, 40, 60, 'active'),
(7, 4, 65, 25, 'active'),
(8, 4, 65, 50, 'active'),
(9, 4, 65, 75, 'active'),
(10, 8, 85, 50, 'active')
ON CONFLICT (table_number) DO NOTHING;

-- ============================================
-- СОЗДАНИЕ АДМИНИСТРАТОРА
-- ============================================
-- Примечание: Зарегистрируйтесь через приложение, 
-- затем выполните этот запрос для назначения администратора:
-- UPDATE profiles SET role = 'admin' WHERE email = 'ваш_email@example.com';
