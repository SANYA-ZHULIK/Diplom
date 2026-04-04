// Конфигурация Supabase
var SUPABASE_URL = 'https://xbwfrfnagesceeozazcr.supabase.co';
var SUPABASE_KEY = 'sb_publishable_8mGgiwNsFhmiJas-tHWMaw_ab_M50Bf';

// Глобальные переменные приложения
var currentUser = null;
var currentProfile = null;
var isAdmin = false;
var supabaseClient = null;

// Зоны заведения
var zones = ['main', 'middle', 'basement', 'dancefloor'];
var zoneNames = {
    'main': 'Основной зал',
    'middle': 'Средний зал',
    'basement': 'Подвал',
    'dancefloor': 'Танцпол'
};

function initSupabase() {
    if (supabaseClient) return supabaseClient;
    
    if (SUPABASE_KEY === 'YOUR_ANON_KEY_HERE') {
        console.error('⚠️ Установите ваш anon ключ в js/supabase.js!');
        return null;
    }
    
    // Ждем загрузки Supabase CDN
    if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('Supabase клиент инициализирован');
        return supabaseClient;
    } else {
        console.error('Supabase библиотека не загружена');
        return null;
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(function() {
        initSupabase();
    }, 100);
    
    // Минимальная дата - сегодня
    var dateInput = document.getElementById('bookingDate');
    if (dateInput) {
        var today = new Date().toISOString().split('T')[0];
        dateInput.min = today;
        dateInput.value = today;
    }
    
    // Обновляем часы в селекторе времени
    var timeSelect = document.getElementById('bookingTime');
    if (timeSelect) {
        var currentHour = new Date().getHours();
        var defaultTime = Math.max(12, Math.min(currentHour + 1, 21));
        timeSelect.value = defaultTime.toString().padStart(2, '0') + ':00';
    }
    
    // Инициализация переключателя зон
    initZoneSwitcher();
});

function initZoneSwitcher() {
    var container = document.getElementById('zoneSelector');
    if (!container) return;
    
    var currentZone = getCurrentZone();
    var currentIndex = zones.indexOf(currentZone);
    
    container.innerHTML = '<div class="zone-nav">' +
        '<button class="zone-arrow" onclick="changeZone(-1)">◀</button>' +
        '<span class="zone-title" id="zoneTitle">' + zoneNames[currentZone] + '</span>' +
        '<button class="zone-arrow" onclick="changeZone(1)">▶</button>' +
        '</div>';
}

function changeZone(direction) {
    var currentZone = getCurrentZone();
    var currentIndex = zones.indexOf(currentZone);
    
    var newIndex = currentIndex + direction;
    if (newIndex < 0) newIndex = zones.length - 1;
    if (newIndex >= zones.length) newIndex = 0;
    
    var newZone = zones[newIndex];
    sessionStorage.setItem('currentZone', newZone);
    
    var zoneTitleEl = document.getElementById('zoneTitle');
    if (zoneTitleEl) zoneTitleEl.textContent = zoneNames[newZone];
    
    if (typeof loadHallMap === 'function') {
        loadHallMap();
    }
}

function getCurrentZone() {
    return sessionStorage.getItem('currentZone') || 'main';
}

function showNotification(message, type) {
    type = type || 'info';
    var notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = 'notification ' + type + ' show';
    
    setTimeout(function() {
        notification.classList.remove('show');
    }, 3000);
}

function showModal(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function hideModal(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

function formatDate(dateString) {
    if (!dateString) return '';
    var date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

function formatDateTime(dateString, timeString) {
    if (!dateString || !timeString) return '';
    var date = new Date(dateString + 'T' + timeString);
    return date.toLocaleString('ru-RU', {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getBookingStatusText(status) {
    var statuses = {
        'pending': 'Ожидает подтверждения',
        'confirmed': 'Подтверждено',
        'completed': 'Завершено',
        'cancelled': 'Отменено'
    };
    return statuses[status] || status;
}
