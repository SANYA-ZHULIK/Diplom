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
    
    if (typeof supabase !== 'undefined' && typeof supabase.createClient === 'function') {
        supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('✓ Supabase инициализирован');
        return supabaseClient;
    } else {
        console.error('✗ Supabase библиотека не загружена');
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
    
    container.innerHTML = '<div class="zone-nav">' +
        '<button class="zone-arrow" onclick="changeZone(-1)" aria-label="Предыдущая зона"><i class="fas fa-chevron-left"></i></button>' +
        '<span class="zone-title" id="zoneTitle">' + zoneNames[currentZone] + '</span>' +
        '<button class="zone-arrow" onclick="changeZone(1)" aria-label="Следующая зона"><i class="fas fa-chevron-right"></i></button>' +
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
    
    var icon = '';
    switch(type) {
        case 'success': icon = '<i class="fas fa-check-circle"></i> '; break;
        case 'error': icon = '<i class="fas fa-exclamation-circle"></i> '; break;
        case 'warning': icon = '<i class="fas fa-exclamation-triangle"></i> '; break;
        default: icon = '<i class="fas fa-info-circle"></i> ';
    }
    
    notification.innerHTML = icon + message;
    notification.className = 'notification ' + type + ' show';
    
    setTimeout(function() {
        notification.classList.remove('show');
    }, 4000);
}

function showModal(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Focus trap for accessibility
        var firstInput = modal.querySelector('input, button:not(.modal-close)');
        if (firstInput) firstInput.focus();
    }
}

function hideModal(modalId) {
    var modal = document.getElementById(modalId);
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Close modal on backdrop click
document.addEventListener('click', function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.classList.remove('active');
        document.body.style.overflow = '';
    }
});

// Close modal on Escape key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        var activeModal = document.querySelector('.modal.active');
        if (activeModal) {
            activeModal.classList.remove('active');
            document.body.style.overflow = '';
        }
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
