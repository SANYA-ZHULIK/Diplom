// === КАРТА ЗАЛА ===

var hallTables = [];
var currentBookings = [];
var mapInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('hallMap')) {
        setTimeout(function initMap() {
            loadHallMap();
            if (mapInterval) clearInterval(mapInterval);
            mapInterval = setInterval(loadHallMap, 30000);
        }, 500);
    }
});

async function loadHallMap() {
    var hallMap = document.getElementById('hallMap');
    if (!hallMap) return;
    
    if (!supabaseClient) {
        hallMap.innerHTML = '<div class="loading">Ожидание подключения к базе данных...</div>';
        return;
    }
    
    var date = document.getElementById('bookingDate') && document.getElementById('bookingDate').value;
    var time = document.getElementById('bookingTime') && document.getElementById('bookingTime').value;
    var currentZone = getCurrentZone();
    
    if (!date || !time) return;
    
    try {
        hallMap.innerHTML = '<div class="loading">Загрузка карты зала...</div>';
        
        var tablesResult = await supabaseClient
            .from('tables')
            .select('*')
            .eq('status', 'active')
            .order('table_number', { ascending: true });
        
        if (tablesResult.error) {
            console.error('Ошибка загрузки столиков:', tablesResult.error);
            hallMap.innerHTML = '<div class="loading">Ошибка загрузки карты</div>';
            return;
        }
        
        var allTables = tablesResult.data || [];
        hallTables = allTables.filter(function(t) { return t.zone === currentZone; });
        
        var tableIds = hallTables.map(function(t) { return t.id; });
        
        var bookingsResult = await supabaseClient
            .from('bookings')
            .select('*')
            .eq('booking_date', date)
            .neq('status', 'cancelled')
            .lte('booking_time', time)
            .gte('end_time', time);
        
        if (bookingsResult.error) {
            console.error('Ошибка загрузки бронирований:', bookingsResult.error);
        }
        
        var allBookings = bookingsResult.data || [];
        currentBookings = allBookings.filter(function(b) { return tableIds.indexOf(b.table_id) !== -1; });
        
        renderHallMap(currentZone);
        
    } catch (err) {
        console.error('Ошибка загрузки карты:', err);
        hallMap.innerHTML = '<div class="loading">Ошибка загрузки</div>';
    }
}

function renderHallMap(zone) {
    var hallMap = document.getElementById('hallMap');
    if (!hallMap) return;
    
    hallMap.innerHTML = '';
    
    var decor = '';
    
    if (zone === 'main') {
        decor = '<div class="hall-icon window-icon" style="left: 10%; top: 5%;"><i class="fa-solid fa-window-frame"></i></div>' +
                '<div class="hall-icon window-icon" style="left: 45%; top: 5%;"><i class="fa-solid fa-window-frame"></i></div>' +
                '<div class="hall-icon window-icon" style="right: 10%; top: 5%;"><i class="fa-solid fa-window-frame"></i></div>' +
                '<div class="hall-icon entrance-icon"><i class="fa-solid fa-door-open"></i></div>' +
                '<div class="hall-icon bar-icon"><i class="fa-solid fa-champagne-glasses"></i><span>БАР</span><i class="fa-solid fa-champagne-glasses"></i></div>';
    } else if (zone === 'middle') {
        decor = '<div class="hall-icon window-icon" style="left: 10%; top: 5%;"><i class="fa-solid fa-window-frame"></i></div>' +
                '<div class="hall-icon window-icon" style="left: 45%; top: 5%;"><i class="fa-solid fa-window-frame"></i></div>' +
                '<div class="hall-icon window-icon" style="right: 10%; top: 5%;"><i class="fa-solid fa-window-frame"></i></div>' +
                '<div class="hall-icon zone-label"><i class="fa-solid fa-door-open"></i><span>Средний зал</span></div>';
    } else if (zone === 'basement') {
        decor = '<div class="hall-icon candle-icon" style="left: 20%; top: 15%;"><i class="fa-solid fa-fire-flame-curved"></i></div>' +
                '<div class="hall-icon candle-icon" style="right: 20%; top: 15%;"><i class="fa-solid fa-fire-flame-curved"></i></div>' +
                '<div class="hall-icon zone-label"><i class="fa-solid fa-wine-glass"></i><span>Камерный зал</span></div>';
    } else if (zone === 'dancefloor') {
        decor = '<div class="hall-icon disco-ball" style="left: 50%; top: 35%; transform: translateX(-50%);"><i class="fa-solid fa-disc-drive"></i></div>' +
                '<div class="hall-icon dancefloor-area"><i class="fa-solid fa-music"></i><span>ТАНЦПОЛ</span><i class="fa-solid fa-music"></i></div>';
    }
    
    hallMap.innerHTML = decor;
    
    if (hallTables.length === 0) {
        hallMap.innerHTML += '<div class="loading">В этой зоне нет столиков</div>';
        return;
    }
    
    hallTables.forEach(function(table) {
        var tableElement = createTableElement(table);
        hallMap.appendChild(tableElement);
    });
}

function createTableElement(table) {
    var div = document.createElement('div');
    div.className = 'table';
    div.style.left = table.position_x + '%';
    div.style.top = table.position_y + '%';
    
    var status = getTableStatus(table.id);
    var isTablet = table.seats <= 4;
    var shapeClass = isTablet ? 'table-tablet' : 'table-shape';
    
    div.innerHTML = 
        '<div class="' + shapeClass + ' ' + status + '" ' +
             'onclick="onTableClick(' + table.id + ', \'' + status + '\')" ' +
             'title="Столик ' + table.table_number + ' - ' + getStatusText(status) + '">' +
            table.table_number +
        '</div>' +
        '<div class="table-seats">' + table.seats + ' мест</div>';
    
    return div;
}

function getTableStatus(tableId) {
    var booking = currentBookings.find(function(b) { return b.table_id === tableId; });
    if (!booking) {
        return 'available';
    }
    return booking.status;
}

function getStatusText(status) {
    var statusTexts = {
        'available': 'Свободно',
        'pending': 'Ожидает подтверждения',
        'confirmed': 'Занято',
        'completed': 'Завершено',
        'cancelled': 'Отменено'
    };
    return statusTexts[status] || status;
}

function onTableClick(tableId, status) {
    if (!currentUser && status === 'available') {
        showNotification('Для бронирования необходимо войти в систему', 'error');
        showModal('loginModal');
        return;
    }
    
    var table = hallTables.find(function(t) { return t.id === tableId; });
    if (!table) return;
    
    var date = document.getElementById('bookingDate') && document.getElementById('bookingDate').value;
    var time = document.getElementById('bookingTime') && document.getElementById('bookingTime').value;
    
    if (status === 'available') {
        document.getElementById('bookingTableId').value = tableId;
        document.getElementById('bookingTableNumber').textContent = table.table_number;
        document.getElementById('bookingTableSeats').textContent = table.seats;
        document.getElementById('bookingDateDisplay').textContent = formatDate(date);
        document.getElementById('bookingTimeDisplay').textContent = time;
        
        if (currentProfile) {
            document.getElementById('bookingGuestName').value = currentProfile.full_name || '';
            document.getElementById('bookingGuestPhone').value = currentProfile.phone || '';
        }
        
        showModal('bookingModal');
    } else if (status === 'confirmed') {
        showNotification('Столик ' + table.table_number + ' уже забронирован', 'info');
    } else if (status === 'pending') {
        showNotification('Столик ' + table.table_number + ' ожидает подтверждения', 'info');
    }
}
