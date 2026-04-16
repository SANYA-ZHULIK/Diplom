// === ЛИЧНЫЙ КАБИНЕТ ===

var userBookings = [];

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('profileContent')) {
        setTimeout(function() {
            checkPageAccess();
            loadProfileData();
            subscribeToBookings();
        }, 700);
    }
});

async function loadProfileData() {
    if (!currentUser || !checkPageAccess()) return;
    
    if (!supabaseClient) {
        console.log('Supabase not ready');
        return;
    }
    
    var profileNameEl = document.getElementById('profileName');
    var profileEmailEl = document.getElementById('profileEmail');
    
    if (profileNameEl) profileNameEl.textContent = currentProfile && currentProfile.full_name ? currentProfile.full_name : 'Пользователь';
    if (profileEmailEl) profileEmailEl.textContent = currentUser.email;
    
    await loadUserBookings();
}

async function loadUserBookings() {
    if (!supabaseClient || !currentUser) return;
    
    try {
        var result = await supabaseClient
            .from('bookings')
            .select('*, table:tables(table_number)')
            .eq('user_id', currentUser.id)
            .order('booking_date', { ascending: false })
            .order('booking_time', { ascending: false });
        
        if (result.error) {
            console.error('Ошибка загрузки бронирований:', result.error);
            return;
        }
        
        userBookings = result.data || [];
        renderBookings();
        
    } catch (err) {
        console.error('Ошибка:', err);
    }
}

function renderBookings() {
    var now = new Date();
    
    var upcoming = userBookings.filter(function(b) {
        var bookingDate = new Date(b.booking_date + 'T' + b.booking_time);
        return bookingDate >= now && b.status !== 'cancelled';
    });
    
    var history = userBookings.filter(function(b) {
        var bookingDate = new Date(b.booking_date + 'T' + b.booking_time);
        return bookingDate < now || b.status === 'cancelled';
    });
    
    renderBookingsList('upcomingBookings', upcoming, true);
    renderBookingsList('historyBookings', history, false);
}

function renderBookingsList(elementId, bookings, showActions) {
    var container = document.getElementById(elementId);
    if (!container) return;
    
    if (bookings.length === 0) {
        container.innerHTML = '<div class="loading">Нет бронирований</div>';
        return;
    }
    
    container.innerHTML = bookings.map(function(booking) {
        var bookingDate = new Date(booking.booking_date + 'T' + booking.booking_time);
        var hoursUntilBooking = (bookingDate - new Date()) / (1000 * 60 * 60);
        var canCancel = showActions && 
                         booking.status !== 'cancelled' && 
                         hoursUntilBooking > 2;
        
        var tableNum = booking.table ? booking.table.table_number : '?';
        
        return '<div class="booking-card">' +
            '<div class="booking-info-main">' +
                '<h4>Столик №' + tableNum + '</h4>' +
                '<p>' +
                    formatDate(booking.booking_date) + ' в ' + booking.booking_time + ' • ' +
                    booking.duration + ' часов • ' +
                    booking.guest_name +
                '</p>' +
            '</div>' +
            '<div class="booking-status ' + booking.status + '">' +
                getBookingStatusText(booking.status) +
            '</div>' +
            (canCancel ? 
                '<div class="booking-actions">' +
                    '<button class="btn btn-outline btn-sm" onclick="showCancelModal(' + booking.id + ', \'' + booking.user_id + '\')">' +
                        'Отменить' +
                    '</button>' +
                '</div>' : ''
            ) +
        '</div>';
    }).join('');
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(function(tab) {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
    
    var tabElement = document.getElementById(tabName + 'Tab');
    if (tabElement) tabElement.classList.add('active');
    if (event && event.target) event.target.classList.add('active');
}

function subscribeToBookings() {
    if (!supabaseClient || !currentUser) return;
    
    var channel = supabaseClient
        .channel('bookings-changes')
        .on('postgres_changes', 
            { 
                event: '*', 
                schema: 'public', 
                table: 'bookings',
                filter: 'user_id=eq.' + currentUser.id
            },
            function(payload) {
                console.log('Изменение в бронированиях:', payload);
                loadUserBookings();
                showNotification('Список бронирований обновлен', 'info');
            }
        );
    
    channel.subscribe();
}
