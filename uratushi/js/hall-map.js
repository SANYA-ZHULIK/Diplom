// === КАРТА ЗАЛА ===

var hallTables = [];
var currentBookings = [];
var mapInterval = null;

document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('hallMap')) {
        setDefaultDate();
        setTimeout(function initMap() {
            loadHallMap();
            if (mapInterval) clearInterval(mapInterval);
            mapInterval = setInterval(loadHallMap, 30000);
        }, 500);
    }
});

function setDefaultDate() {
    var dateInput = document.getElementById('bookingDate');
    if (dateInput && !dateInput.value) {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0');
        var yyyy = today.getFullYear();
        dateInput.value = yyyy + '-' + mm + '-' + dd;
    }
}

async function loadHallMap() {
    var hallMap = document.getElementById('hallMap');
    if (!hallMap) return;
    
    if (!supabaseClient) {
        hallMap.innerHTML = '<div class="loading"><i class="fas fa-database"></i><p>Ожидание подключения...</p></div>';
        return;
    }
    
    var date = document.getElementById('bookingDate') && document.getElementById('bookingDate').value;
    var time = document.getElementById('bookingTime') && document.getElementById('bookingTime').value;
    var currentZone = getCurrentZone();
    
    if (!date || !time) {
        hallMap.innerHTML = '<div class="loading"><i class="fas fa-calendar-alt"></i><p>Выберите дату и время</p></div>';
        return;
    }
    
    try {
        hallMap.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-pulse"></i><p>Загрузка карты...</p></div>';
        
        var tablesResult = await supabaseClient
            .from('tables')
            .select('*')
            .eq('status', 'active')
            .order('table_number', { ascending: true });
        
        if (tablesResult.error) {
            console.error('Ошибка загрузки столиков:', tablesResult.error);
            hallMap.innerHTML = '<div class="loading"><i class="fas fa-exclamation-triangle"></i><p>Ошибка загрузки</p></div>';
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
        
        hallMap.setAttribute('data-zone', currentZone);
        renderHallMap(currentZone);
        
    } catch (err) {
        console.error('Ошибка загрузки карты:', err);
        hallMap.innerHTML = '<div class="loading"><i class="fas fa-exclamation-circle"></i><p>Ошибка загрузки</p></div>';
    }
}

function renderHallMap(zone) {
    var hallMap = document.getElementById('hallMap');
    if (!hallMap) return;
    
    hallMap.innerHTML = '';
    
    var decor = '';
    
    if (zone === 'main') {
        decor = '<div class="hall-icon window-icon" style="left: 8%; top: 6%;"><i class="fa-solid fa-border-all"></i></div>' +
                '<div class="hall-icon window-icon" style="left: 42%; top: 6%;"><i class="fa-solid fa-border-all"></i></div>' +
                '<div class="hall-icon window-icon" style="right: 8%; top: 6%;"><i class="fa-solid fa-border-all"></i></div>' +
                '<div class="hall-icon entrance-icon" style="right: 3%; top: 3%;"><i class="fa-solid fa-arrow-right-to-bracket"></i><span>ВХОД</span></div>' +
                '<div class="hall-icon bar-icon" style="left: 50%; bottom: 5%; transform: translateX(-50%);"><i class="fa-solid fa-wine-glass-alt"></i><span>БАР</span><i class="fa-solid fa-martini-glass"></i></div>';
    } else if (zone === 'middle') {
        decor = '<div class="hall-icon window-icon" style="left: 8%; top: 6%;"><i class="fa-solid fa-border-all"></i></div>' +
                '<div class="hall-icon window-icon" style="left: 42%; top: 6%;"><i class="fa-solid fa-border-all"></i></div>' +
                '<div class="hall-icon window-icon" style="right: 8%; top: 6%;"><i class="fa-solid fa-border-all"></i></div>' +
                '<div class="hall-icon zone-label" style="left: 50%; top: 5%; transform: translateX(-50%);"><i class="fa-solid fa-door-open"></i><span>Средний зал</span></div>';
    } else if (zone === 'basement') {
        decor = '<div class="hall-icon candle-icon" style="left: 15%; top: 20%;"><i class="fa-solid fa-fire-flame-curved"></i></div>' +
                '<div class="hall-icon candle-icon" style="right: 15%; top: 20%;"><i class="fa-solid fa-fire-flame-curved"></i></div>' +
                '<div class="hall-icon candle-icon" style="left: 30%; top: 60%;"><i class="fa-solid fa-fire-flame-curved"></i></div>' +
                '<div class="hall-icon candle-icon" style="right: 30%; top: 60%;"><i class="fa-solid fa-fire-flame-curved"></i></div>' +
                '<div class="hall-icon zone-label" style="left: 50%; top: 5%; transform: translateX(-50%);"><i class="fa-solid fa-wine-glass"></i><span>Камерный зал</span></div>';
    } else if (zone === 'dancefloor') {
        decor = '<div class="hall-icon disco-ball" style="left: 50%; top: 30%; transform: translateX(-50%);"><i class="fa-solid fa-compact-disc"></i></div>' +
                '<div class="hall-icon dancefloor-area" style="left: 50%; bottom: 12%; transform: translateX(-50%);"><i class="fa-solid fa-music"></i><span>ТАНЦПОЛ</span><i class="fa-solid fa-music"></i></div>';
    }
    
    hallMap.innerHTML = decor;
    
    if (hallTables.length === 0) {
        hallMap.innerHTML += '<div class="loading"><i class="fas fa-chair"></i><p>В этой зоне пока нет столиков</p></div>';
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
    var seats = table.seats || 2;
    var isVIP = table.table_number >= 10 && table.table_number <= 12;
    
    var sizeClass = 'table-size-2';
    if (seats <= 2) sizeClass = 'table-size-2';
    else if (seats <= 4) sizeClass = 'table-size-4';
    else if (seats <= 6) sizeClass = 'table-size-6';
    else sizeClass = 'table-size-8';
    
    var shapeClass = 'table-round';
    var chairsHTML = getChairsHTML(seats, shapeClass);
    
    if (isVIP) {
        sizeClass += ' table-vip';
    }
    
    div.innerHTML = 
        '<div class="table-group ' + sizeClass + ' ' + shapeClass + '" ' +
             'onclick="onTableClick(' + table.id + ', \'' + status + '\')" ' +
             'title="Столик ' + table.table_number + ' - ' + getStatusText(status) + '" ' +
             'role="button" aria-label="Столик ' + table.table_number + ', ' + getStatusText(status) + '">' +
             chairsHTML +
             '<div class="table-body status-' + status + '">' +
                 '<span class="table-number">' + table.table_number + '</span>' +
             '</div>' +
        '</div>' +
        '<div class="table-seats">' + 
        '<i class="fas fa-user"></i> ' + seats + 
        '</div>';
    
    return div;
}

function getChairsHTML(seats, shapeClass) {
    var chairs = '';
    
    if (seats === 2) {
        chairs = '<div class="chairs-container">' +
                 '<div class="chair chair-top"></div>' +
                 '<div class="chair chair-bottom"></div>' +
                 '</div>';
    } else if (seats === 4) {
        if (shapeClass === 'table-round') {
            chairs = '<div class="chairs-container">' +
                     '<div class="chair chair-top"></div>' +
                     '<div class="chair chair-bottom"></div>' +
                     '<div class="chair chair-left"></div>' +
                     '<div class="chair chair-right"></div>' +
                     '</div>';
        } else {
            chairs = '<div class="chairs-container">' +
                     '<div class="chair chair-top-left"></div>' +
                     '<div class="chair chair-top-right"></div>' +
                     '<div class="chair chair-bottom-left"></div>' +
                     '<div class="chair chair-bottom-right"></div>' +
                     '</div>';
        }
    } else if (seats === 6) {
        chairs = '<div class="chairs-container">' +
                 '<div class="chair chair-top"></div>' +
                 '<div class="chair chair-top-left"></div>' +
                 '<div class="chair chair-top-right"></div>' +
                 '<div class="chair chair-bottom"></div>' +
                 '<div class="chair chair-bottom-left"></div>' +
                 '<div class="chair chair-bottom-right"></div>' +
                 '</div>';
    } else if (seats >= 8) {
        chairs = '<div class="chairs-container">' +
                 '<div class="chair chair-top"></div>' +
                 '<div class="chair chair-top-left"></div>' +
                 '<div class="chair chair-top-right"></div>' +
                 '<div class="chair chair-left"></div>' +
                 '<div class="chair chair-right"></div>' +
                 '<div class="chair chair-bottom"></div>' +
                 '<div class="chair chair-bottom-left"></div>' +
                 '<div class="chair chair-bottom-right"></div>' +
                 '</div>';
    }
    
    return chairs;
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
        'available': 'Свободен',
        'pending': 'Ожидает подтверждения',
        'confirmed': 'Занят',
        'completed': 'Завершено',
        'cancelled': 'Отменено'
    };
    return statusTexts[status] || status;
}

function onTableClick(tableId, status) {
    if (!currentUser && status === 'available') {
        showNotification('Для бронирования необходимо войти', 'info');
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
        showNotification('Столик #' + table.table_number + ' уже забронирован', 'warning');
    } else if (status === 'pending') {
        showNotification('Столик #' + table.table_number + ' ожидает подтверждения', 'info');
    }
}
