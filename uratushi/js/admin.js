// === ПАНЕЛЬ АДМИНИСТРАТОРА ===

var adminBookings = [];
var adminTables = [];
var adminClients = [];
var currentBookingId = null;
var currentClientId = null;
var adminVerified = false;

function verifyAdmin() {
    if (!currentUser || !currentProfile) return false;
    return currentProfile.role === 'admin';
}

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('adminContent')) {
        setTimeout(function() {
            checkPageAccess();
            loadAdminData();
            
            var filterDate = document.getElementById('filterDate');
            if (filterDate) {
                filterDate.value = new Date().toISOString().split('T')[0];
            }
            
            subscribeToAdminUpdates();
        }, 700);
    }
});

async function loadAdminData() {
    if (!checkPageAccess() || !verifyAdmin()) {
        showNotification('Доступ запрещен', 'error');
        return;
    }
    
    if (!supabaseClient) {
        console.log('Supabase not ready');
        return;
    }
    
    await loadAdminBookings();
    await loadAdminTables();
}

function switchAdminTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(function(tab) {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.admin-tabs .tab-btn').forEach(function(btn) {
        btn.classList.remove('active');
    });
    
    var tabElement = document.getElementById(tabName + 'Tab');
    if (tabElement) tabElement.classList.add('active');
    if (event && event.target) event.target.classList.add('active');
}

// === УПРАВЛЕНИЕ БРОНИРОВАНИЯМИ ===

async function loadAdminBookings() {
    if (!supabaseClient) return;
    
    var date = document.getElementById('filterDate') && document.getElementById('filterDate').value;
    var status = document.getElementById('filterStatus') && document.getElementById('filterStatus').value;
    
    try {
        var query = supabaseClient
            .from('bookings')
            .select('*, table:tables(table_number)')
            .order('booking_date', { ascending: true })
            .order('booking_time', { ascending: true });
        
        if (date) {
            query = query.eq('booking_date', date);
        }
        
        if (status) {
            query = query.eq('status', status);
        }
        
        var result = await query;
        
        if (result.error) {
            console.error('Ошибка загрузки бронирований:', result.error);
            return;
        }
        
        adminBookings = result.data || [];
        renderAdminBookings();
        
    } catch (err) {
        console.error('Ошибка:', err);
    }
}

function renderAdminBookings() {
    var tbody = document.getElementById('adminBookingsList');
    if (!tbody) return;
    
    if (adminBookings.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading">Нет бронирований</td></tr>';
        return;
    }
    
    tbody.innerHTML = adminBookings.map(function(booking) {
        var tableNum = booking.table ? booking.table.table_number : '?';
        
        return '<tr>' +
            '<td>#' + booking.id + '</td>' +
            '<td>' + booking.guest_name + '</td>' +
            '<td>' + booking.guest_phone + '</td>' +
            '<td>Столик №' + tableNum + '</td>' +
            '<td>' + formatDate(booking.booking_date) + '<br>' + booking.booking_time + '</td>' +
            '<td>' + booking.duration + ' ч</td>' +
            '<td><span class="booking-status ' + booking.status + '">' +
                getBookingStatusText(booking.status) + '</span></td>' +
            '<td>' + getBookingActions(booking) + '</td>' +
        '</tr>';
    }).join('');
}

function getBookingActions(booking) {
    if (booking.status === 'pending') {
        return '<button class="btn btn-primary btn-sm" onclick="showConfirmModal(' + booking.id + ')">Обработать</button>';
    } else if (booking.status === 'confirmed') {
        return '<button class="btn btn-success btn-sm" onclick="showCompleteModal(' + booking.id + ')">Отметить визит</button>';
    }
    return '-';
}

function showConfirmModal(bookingId) {
    currentBookingId = bookingId;
    var booking = adminBookings.find(function(b) { return b.id === bookingId; });
    if (!booking) return;
    
    var details = document.getElementById('confirmBookingDetails');
    var tableNum = booking.table ? booking.table.table_number : '?';
    
    details.innerHTML = 
        '<p><strong>Клиент:</strong> ' + booking.guest_name + '</p>' +
        '<p><strong>Телефон:</strong> ' + booking.guest_phone + '</p>' +
        '<p><strong>Столик:</strong> №' + tableNum + '</p>' +
        '<p><strong>Дата/время:</strong> ' + formatDate(booking.booking_date) + ' ' + booking.booking_time + '</p>' +
        '<p><strong>Длительность:</strong> ' + booking.duration + ' часов</p>' +
        '<p><strong>Пожелания:</strong> ' + (booking.notes || 'Нет') + '</p>';
    
    showModal('confirmBookingModal');
}

async function approveBooking() {
    if (!verifyAdmin()) { showNotification('Доступ запрещен', 'error'); return; }
    if (!supabaseClient) return;
    
    try {
        var result = await supabaseClient
            .from('bookings')
            .update({ status: 'confirmed' })
            .eq('id', currentBookingId);
        
        if (result.error) {
            console.error('Ошибка подтверждения:', result.error);
            showNotification('Ошибка при подтверждении', 'error');
            return;
        }
        
        hideModal('confirmBookingModal');
        showNotification('Бронирование подтверждено', 'success');
        loadAdminBookings();
        
    } catch (err) {
        console.error('Ошибка:', err);
        showNotification('Произошла ошибка', 'error');
    }
}

async function rejectBooking() {
    if (!verifyAdmin()) { showNotification('Доступ запрещен', 'error'); return; }
    if (!supabaseClient) return;
    
    try {
        var result = await supabaseClient
            .from('bookings')
            .update({ status: 'cancelled' })
            .eq('id', currentBookingId);
        
        if (result.error) {
            console.error('Ошибка отклонения:', result.error);
            showNotification('Ошибка при отклонении', 'error');
            return;
        }
        
        hideModal('confirmBookingModal');
        showNotification('Бронирование отклонено', 'info');
        loadAdminBookings();
        
    } catch (err) {
        console.error('Ошибка:', err);
        showNotification('Произошла ошибка', 'error');
    }
}

function showCompleteModal(bookingId) {
    currentBookingId = bookingId;
    var confirmBtn = document.getElementById('confirmCompleteBtn');
    confirmBtn.onclick = completeBooking;
    showModal('completeModal');
}

async function completeBooking() {
    if (!verifyAdmin()) { showNotification('Доступ запрещен', 'error'); return; }
    if (!supabaseClient) return;
    
    try {
        var result = await supabaseClient
            .from('bookings')
            .update({ status: 'completed' })
            .eq('id', currentBookingId);
        
        if (result.error) {
            console.error('Ошибка завершения:', result.error);
            showNotification('Ошибка при завершении', 'error');
            return;
        }
        
        hideModal('completeModal');
        showNotification('Визит отмечен', 'success');
        loadAdminBookings();
        
    } catch (err) {
        console.error('Ошибка:', err);
        showNotification('Произошла ошибка', 'error');
    }
}

// === УПРАВЛЕНИЕ СТОЛИКАМИ ===

async function loadAdminTables() {
    if (!verifyAdmin()) return;
    if (!supabaseClient) return;
    
    try {
        var result = await supabaseClient
            .from('tables')
            .select('*')
            .order('table_number', { ascending: true });
        
        if (result.error) {
            console.error('Ошибка загрузки столиков:', result.error);
            return;
        }
        
        adminTables = result.data || [];
        renderAdminTables();
        
    } catch (err) {
        console.error('Ошибка:', err);
    }
}

function renderAdminTables() {
    var grid = document.getElementById('tablesGrid');
    if (!grid) return;
    
    if (adminTables.length === 0) {
        grid.innerHTML = '<div class="loading">Нет столиков</div>';
        return;
    }
    
    grid.innerHTML = adminTables.map(function(table) {
        return '<div class="table-card">' +
            '<div class="table-card-header">' +
                '<h4>Столик №' + table.table_number + '</h4>' +
                '<span class="table-status-badge ' + table.status + '">' +
                    (table.status === 'active' ? 'Активен' : 'На ремонте') +
                '</span>' +
            '</div>' +
            '<div class="table-card-info">' +
                '<p>🪑 ' + table.seats + ' мест (мин. ' + (table.min_guests || 1) + ')</p>' +
                '<p>📍 Позиция: ' + table.position_x + '%, ' + table.position_y + '%</p>' +
            '</div>' +
            '<div class="table-card-actions">' +
                '<button class="btn btn-outline btn-sm" onclick="editTable(' + table.id + ')">Редактировать</button>' +
                '<button class="btn btn-danger btn-sm" onclick="deleteTable(' + table.id + ')">Удалить</button>' +
            '</div>' +
        '</div>';
    }).join('');
}

function showAddTableModal() {
    document.getElementById('tableModalTitle').textContent = 'Добавить столик';
    document.getElementById('tableForm').reset();
    document.getElementById('tableId').value = '';
    showModal('tableModal');
}

function editTable(tableId) {
    if (!verifyAdmin()) { showNotification('Доступ запрещен', 'error'); return; }
    var table = adminTables.find(function(t) { return t.id === tableId; });
    if (!table) return;
    
    document.getElementById('tableModalTitle').textContent = 'Редактировать столик';
    document.getElementById('tableId').value = table.id;
    document.getElementById('tableNumber').value = table.table_number;
    document.getElementById('tableSeats').value = table.seats;
    document.getElementById('tableMinGuests').value = table.min_guests || 1;
    document.getElementById('tableX').value = table.position_x;
    document.getElementById('tableY').value = table.position_y;
    document.getElementById('tableStatus').value = table.status;
    
    showModal('tableModal');
}

async function handleTableSave(event) {
    event.preventDefault();
    if (!verifyAdmin()) { showNotification('Доступ запрещен', 'error'); return; }
    if (!supabaseClient) return;
    
    var tableId = document.getElementById('tableId').value;
    var tableData = {
        table_number: parseInt(document.getElementById('tableNumber').value),
        seats: parseInt(document.getElementById('tableSeats').value),
        min_guests: parseInt(document.getElementById('tableMinGuests').value) || 1,
        position_x: parseInt(document.getElementById('tableX').value),
        position_y: parseInt(document.getElementById('tableY').value),
        status: document.getElementById('tableStatus').value
    };
    
    try {
        var result;
        
        if (tableId) {
            result = await supabaseClient
                .from('tables')
                .update(tableData)
                .eq('id', tableId);
        } else {
            result = await supabaseClient
                .from('tables')
                .insert([tableData]);
        }
        
        if (result.error) {
            console.error('Ошибка сохранения:', result.error);
            showNotification('Ошибка при сохранении', 'error');
            return;
        }
        
        hideModal('tableModal');
        showNotification(tableId ? 'Столик обновлен' : 'Столик добавлен', 'success');
        loadAdminTables();
        
    } catch (err) {
        console.error('Ошибка:', err);
        showNotification('Произошла ошибка', 'error');
    }
}

async function deleteTable(tableId) {
    if (!verifyAdmin()) { showNotification('Доступ запрещен', 'error'); return; }
    if (!confirm('Вы уверены, что хотите удалить этот столик?')) return;
    if (!supabaseClient) return;
    
    try {
        var result = await supabaseClient
            .from('tables')
            .delete()
            .eq('id', tableId);
        
        if (result.error) {
            console.error('Ошибка удаления:', result.error);
            showNotification('Ошибка при удалении', 'error');
            return;
        }
        
        showNotification('Столик удален', 'success');
        loadAdminTables();
        
    } catch (err) {
        console.error('Ошибка:', err);
        showNotification('Произошла ошибка', 'error');
    }
}

// === ПОДПИСКИ НА ОБНОВЛЕНИЯ ===

function subscribeToAdminUpdates() {
    if (!supabaseClient) return;
    
    var channel = supabaseClient
        .channel('admin-bookings')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'bookings' },
            function(payload) {
                console.log('Обновление бронирований:', payload);
                loadAdminBookings();
            }
        );
    
    channel.subscribe();
}
