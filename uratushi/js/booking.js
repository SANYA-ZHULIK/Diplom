// === БРОНИРОВАНИЕ ===

async function handleBooking(event) {
    event.preventDefault();
    
    if (!supabaseClient) {
        showNotification('Ошибка: База данных не подключена', 'error');
        return;
    }
    
    if (!currentUser) {
        showNotification('Для бронирования необходимо войти в систему', 'error');
        hideModal('bookingModal');
        showModal('loginModal');
        return;
    }
    
    var tableId = document.getElementById('bookingTableId').value;
    var date = document.getElementById('bookingDate').value;
    var time = document.getElementById('bookingTime').value;
    var guests = parseInt(document.getElementById('bookingGuests').value);
    var duration = parseInt(document.getElementById('bookingDuration').value);
    var guestName = document.getElementById('bookingGuestName').value.trim();
    var guestPhone = document.getElementById('bookingGuestPhone').value.trim();
    var notes = document.getElementById('bookingNotes').value.trim();
    var errorElement = document.getElementById('bookingError');
    
    errorElement.textContent = '';
    
    if (!guestName || !guestPhone) {
        errorElement.textContent = 'Пожалуйста, заполните все обязательные поля';
        return;
    }
    
    var minGuests = parseInt(document.getElementById('bookingGuests').min) || 1;
    var maxGuests = parseInt(document.getElementById('bookingGuests').max) || 20;
    
    if (guests < minGuests) {
        errorElement.textContent = 'Минимальное количество гостей: ' + minGuests;
        return;
    }
    
    if (guests > maxGuests) {
        errorElement.textContent = 'Максимальное количество гостей: ' + maxGuests;
        return;
    }
    
    try {
        var startDateTime = new Date(date + 'T' + time);
        var endDateTime = new Date(startDateTime.getTime() + duration * 60 * 60 * 1000);
        var endTime = endDateTime.toTimeString().slice(0, 5);
        
        var existingResult = await supabaseClient
            .from('bookings')
            .select('*')
            .eq('table_id', tableId)
            .eq('booking_date', date)
            .neq('status', 'cancelled')
            .lte('booking_time', endTime)
            .gte('end_time', time)
            .maybeSingle();
        
        if (existingResult.error) {
            console.error('Ошибка проверки доступности:', existingResult.error);
        }
        
        if (existingResult.data) {
            errorElement.textContent = 'К сожалению, этот столик только что был забронирован другим пользователем';
            loadHallMap();
            return;
        }
        
        var bookingData = {
            user_id: currentUser.id,
            table_id: parseInt(tableId),
            booking_date: date,
            booking_time: time,
            guest_count: guests,
            end_time: endTime,
            duration: duration,
            guest_name: guestName,
            guest_phone: guestPhone,
            notes: notes,
            status: 'pending',
            created_at: new Date().toISOString()
        };
        
        var insertResult = await supabaseClient
            .from('bookings')
            .insert([bookingData])
            .select()
            .single();
        
        if (insertResult.error) {
            console.error('Ошибка создания бронирования:', insertResult.error);
            errorElement.textContent = 'Ошибка при создании бронирования. Попробуйте позже.';
            return;
        }
        
        loadHallMap();
        hideModal('bookingModal');
        showNotification('Бронирование создано! Ожидайте подтверждения от администратора.', 'success');
        document.getElementById('bookingForm').reset();
        
    } catch (err) {
        console.error('Ошибка бронирования:', err);
        errorElement.textContent = 'Произошла ошибка при бронировании';
    }
}

async function cancelBooking(bookingId, userId) {
    if (!supabaseClient) {
        showNotification('Ошибка: База данных не подключена', 'error');
        return;
    }
    
    if (currentUser && userId && currentUser.id !== userId) {
        showNotification('Вы можете отменить только свое бронирование', 'error');
        return;
    }
    
    try {
        var getResult = await supabaseClient
            .from('bookings')
            .select('*')
            .eq('id', bookingId)
            .single();
        
        if (getResult.error) {
            console.error('Ошибка получения бронирования:', getResult.error);
            showNotification('Ошибка при отмене бронирования', 'error');
            return;
        }
        
        var booking = getResult.data;
        
        if (currentUser && currentUser.id !== booking.user_id && currentProfile.role !== 'admin') {
            showNotification('Вы можете отменить только свое бронирование', 'error');
            return;
        }
        
        var bookingDate = new Date(booking.booking_date + 'T' + booking.booking_time);
        var now = new Date();
        var hoursUntilBooking = (bookingDate - now) / (1000 * 60 * 60);
        
        if (hoursUntilBooking < 2) {
            showNotification('Отмена возможна только за 2 часа до визита', 'error');
            return;
        }
        
        var updateResult = await supabaseClient
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', bookingId);
        
        if (updateResult.error) {
            console.error('Ошибка отмены бронирования:', updateResult.error);
            showNotification('Ошибка при отмене бронирования', 'error');
            return;
        }
        
        hideModal('cancelModal');
        showNotification('Бронирование отменено', 'success');
        
        if (typeof loadProfileData === 'function') {
            loadProfileData();
        }
        
    } catch (err) {
        console.error('Ошибка отмены:', err);
        showNotification('Произошла ошибка при отмене', 'error');
    }
}

function showCancelModal(bookingId, userId, isAdmin) {
    var confirmBtn = document.getElementById('confirmCancelBtn');
    if (currentProfile && currentProfile.role !== 'admin' && userId && currentUser && currentUser.id !== userId) {
        showNotification('Вы можете отменить только свое бронирование', 'error');
        return;
    }
    confirmBtn.onclick = function() { cancelBooking(bookingId); };
    showModal('cancelModal');
}
