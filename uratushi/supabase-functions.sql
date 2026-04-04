-- Дополнительные функции для Supabase
-- ============================================

-- Функция для проверки доступности столика
CREATE OR REPLACE FUNCTION check_table_availability(
    p_table_id INTEGER,
    p_date DATE,
    p_start_time TIME,
    p_end_time TIME
) RETURNS BOOLEAN AS $$
DECLARE
    existing_booking INTEGER;
BEGIN
    SELECT id INTO existing_booking
    FROM bookings
    WHERE table_id = p_table_id
        AND booking_date = p_date
        AND status NOT IN ('cancelled', 'completed')
        AND (
            (booking_time <= p_end_time AND end_time >= p_start_time)
        );
    
    RETURN existing_booking IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Функция для получения статистики бронирований
CREATE OR REPLACE FUNCTION get_booking_statistics(p_start_date DATE, p_end_date DATE)
RETURNS TABLE (
    total_bookings BIGINT,
    confirmed_bookings BIGINT,
    pending_bookings BIGINT,
    cancelled_bookings BIGINT,
    completed_bookings BIGINT,
    total_guests BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) FILTER (WHERE status NOT IN ('cancelled'))::BIGINT as total_bookings,
        COUNT(*) FILTER (WHERE status = 'confirmed')::BIGINT as confirmed_bookings,
        COUNT(*) FILTER (WHERE status = 'pending')::BIGINT as pending_bookings,
        COUNT(*) FILTER (WHERE status = 'cancelled')::BIGINT as cancelled_bookings,
        COUNT(*) FILTER (WHERE status = 'completed')::BIGINT as completed_bookings,
        COALESCE(SUM(t.seats) FILTER (WHERE b.status NOT IN ('cancelled')), 0)::BIGINT as total_guests
    FROM bookings b
    JOIN tables t ON b.table_id = t.id
    WHERE b.booking_date BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Триггер для обновления времени изменения профиля
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Триггер для актуализации статуса бронирований
-- (помечает прошедшие бронирования как "просроченные")
CREATE OR REPLACE FUNCTION update_expired_bookings()
RETURNS void AS $$
BEGIN
    UPDATE bookings
    SET status = 'cancelled'
    WHERE status = 'pending'
        AND (
            booking_date < CURRENT_DATE
            OR (booking_date = CURRENT_DATE AND booking_time < CURRENT_TIME - INTERVAL '2 hours')
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Создаем фоновую задачу для обновления статусов (если доступно расширение pg_cron)
-- SELECT cron.schedule('update-expired-bookings', '0 * * * *', 'SELECT update_expired_bookings()');

-- Представление для администраторов со всеми бронированиями
CREATE OR REPLACE VIEW admin_bookings_view AS
SELECT 
    b.*,
    t.table_number,
    t.seats,
    u.email as user_email,
    p.full_name as user_full_name,
    p.phone as user_phone
FROM bookings b
JOIN tables t ON b.table_id = t.id
JOIN auth.users u ON b.user_id = u.id
LEFT JOIN profiles p ON b.user_id = p.id;

-- Представление для популярных времени бронирований
CREATE OR REPLACE VIEW popular_booking_times AS
SELECT 
    EXTRACT(HOUR FROM booking_time) as hour,
    EXTRACT(DOW FROM booking_date) as day_of_week,
    COUNT(*) as booking_count
FROM bookings
WHERE status NOT IN ('cancelled')
GROUP BY hour, day_of_week
ORDER BY booking_count DESC;

-- Индексы для оптимизации
CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(booking_date);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_date_time ON bookings(booking_date, booking_time);
CREATE INDEX IF NOT EXISTS idx_bonus_history_user ON bonus_history(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
