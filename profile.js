// profile.js - личный кабинет

let currentUserData = null;

document.addEventListener('DOMContentLoaded', async () => {
    // Ждём загрузку Supabase
    const waitForSupabase = setInterval(async () => {
        if (window.supabaseClient && window.currentUser !== undefined) {
            clearInterval(waitForSupabase);
            
            // Проверяем авторизацию
            if (!isAuthenticated()) {
                window.location.href = '/';
                return;
            }
            
            await loadProfileData();
            setupProfileTabs();
            setupProfileForm();
        }
    }, 300);
});

async function loadProfileData() {
    const user = getCurrentUser();
    if (!user) return;
    
    currentUserData = user;
    
    // Обновляем аватар и имя
    const userName = user.full_name || user.email?.split('@')[0] || 'Пользователь';
    document.getElementById('avatar-letter').textContent = userName.charAt(0).toUpperCase();
    document.getElementById('profile-user-name').textContent = userName;
    document.getElementById('profile-user-email').textContent = user.email || '';
    
    // Заполняем форму настроек
    document.getElementById('edit-full-name').value = user.full_name || '';
    document.getElementById('edit-phone').value = user.phone || '';
    document.getElementById('edit-email').value = user.email || '';
    
    // Загружаем данные
    await loadUserBookings();
    await loadUserOrders();
    await loadUserReviews();
}

async function loadUserBookings() {
    const client = window.supabaseClient;
    const user = getCurrentUser();
    if (!client || !user) return;
    
    try {
        const { data, error } = await client
            .from('bookings')
            .select('*, tables:table_id(number, seats)')
            .eq('user_id', user.id)
            .order('date', { ascending: false })
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        renderBookings(data || []);
    } catch (err) {
        console.error('Error loading bookings:', err);
        document.getElementById('user-bookings-list').innerHTML = 
            '<div class="no-data">Ошибка загрузки бронирований</div>';
    }
}

function renderBookings(bookings) {
    const container = document.getElementById('user-bookings-list');
    
    if (!bookings.length) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📅</div>
                <p>У вас пока нет бронирований</p>
                <a href="/#booking" class="btn-primary">Забронировать столик</a>
            </div>
        `;
        return;
    }
    
    const statusLabels = {
        new: '⏳ Новая',
        confirmed: '✅ Подтверждена',
        completed: '✔️ Завершена',
        cancelled: '❌ Отменена'
    };
    
    const statusClass = {
        new: 'status-new',
        confirmed: 'status-confirmed',
        completed: 'status-completed',
        cancelled: 'status-cancelled'
    };
    
    container.innerHTML = bookings.map(booking => `
        <div class="booking-card">
            <div class="booking-header">
                <span class="booking-date">${formatDate(booking.date)}</span>
                <span class="booking-status ${statusClass[booking.status] || ''}">
                    ${statusLabels[booking.status] || booking.status}
                </span>
            </div>
            <div class="booking-details">
                <div class="detail-item">
                    <span class="detail-label">🕐 Время:</span>
                    <span class="detail-value">${booking.time_slot}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">🍽️ Стол:</span>
                    <span class="detail-value">№${booking.tables?.number || booking.table_id}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">👥 Гостей:</span>
                    <span class="detail-value">${booking.guests_count}</span>
                </div>
                ${booking.comment ? `
                <div class="detail-item">
                    <span class="detail-label">💬 Комментарий:</span>
                    <span class="detail-value">${escapeHtml(booking.comment)}</span>
                </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

async function loadUserOrders() {
    const client = window.supabaseClient;
    const user = getCurrentUser();
    if (!client || !user) return;
    
    try {
        const { data, error } = await client
            .from('orders')
            .select('*, order_items(*, menu_items(name, price))')
            .eq('customer_phone', user.phone)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        renderOrders(data || []);
    } catch (err) {
        console.error('Error loading orders:', err);
        document.getElementById('user-orders-list').innerHTML = 
            '<div class="no-data">Ошибка загрузки заказов</div>';
    }
}

function renderOrders(orders) {
    const container = document.getElementById('user-orders-list');
    
    if (!orders.length) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🧾</div>
                <p>У вас пока нет заказов</p>
                <a href="/#menu" class="btn-primary">Посмотреть меню</a>
            </div>
        `;
        return;
    }
    
    const statusLabels = {
        pending: 'В обработке',
        confirmed: 'Подтверждён',
        preparing: 'Готовится',
        ready: 'Готов',
        served: 'Подано',
        paid: 'Оплачен',
        cancelled: 'Отменён'
    };
    
    container.innerHTML = orders.map(order => `
        <div class="order-card">
            <div class="order-header">
                <div class="order-number">Заказ №${order.order_number || order.id}</div>
                <div class="order-status">${statusLabels[order.status] || order.status}</div>
            </div>
            <div class="order-date">${formatDateTime(order.created_at)}</div>
            <div class="order-items">
                ${order.order_items?.map(item => `
                    <div class="order-item">
                        <span class="order-item-name">${escapeHtml(item.menu_items?.name || 'Блюдо')}</span>
                        <span class="order-item-quantity">x${item.quantity}</span>
                        <span class="order-item-price">${item.unit_price} ₽</span>
                    </div>
                `).join('') || '<div class="no-items">Нет позиций</div>'}
            </div>
            <div class="order-total">
                Итого: <strong>${order.total_amount} ₽</strong>
            </div>
            ${order.notes ? `<div class="order-notes">📝 ${escapeHtml(order.notes)}</div>` : ''}
        </div>
    `).join('');
}

async function loadUserReviews() {
    const client = window.supabaseClient;
    const user = getCurrentUser();
    if (!client || !user) return;
    
    try {
        const { data, error } = await client
            .from('reviews')
            .select('*')
            .eq('profile_id', user.id)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        renderReviews(data || []);
    } catch (err) {
        console.error('Error loading reviews:', err);
        document.getElementById('user-reviews-list').innerHTML = 
            '<div class="no-data">Ошибка загрузки отзывов</div>';
    }
}

function renderReviews(reviews) {
    const container = document.getElementById('user-reviews-list');
    
    if (!reviews.length) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">✍️</div>
                <p>Вы ещё не оставляли отзывы</p>
                <a href="/#reviews" class="btn-primary">Оставить отзыв</a>
            </div>
        `;
        return;
    }
    
    container.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <div class="review-rating">${renderStars(review.rating)}</div>
                <div class="review-date">${formatDate(review.created_at)}</div>
            </div>
            <div class="review-content">
                <p>${escapeHtml(review.comment)}</p>
            </div>
        </div>
    `).join('');
}

function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<span class="star ${i <= rating ? 'filled' : ''}">★</span>`;
    }
    return stars;
}

function setupProfileTabs() {
    const tabs = document.querySelectorAll('.profile-nav-link');
    const tabContents = document.querySelectorAll('.profile-tab');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = tab.dataset.tab;
            
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            tabContents.forEach(content => content.classList.remove('active'));
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
}

function setupProfileForm() {
    const form = document.getElementById('profile-settings-form');
    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const fullName = document.getElementById('edit-full-name').value.trim();
            const phone = document.getElementById('edit-phone').value.trim();
            
            if (!fullName) {
                showToast('Введите имя', 'warning');
                return;
            }
            
            try {
                await updateUserProfile({ full_name: fullName, phone: phone });
                showToast('Профиль обновлён', 'success');
                
                // Обновляем отображаемое имя
                const user = getCurrentUser();
                const userName = user.full_name || user.email?.split('@')[0] || 'Пользователь';
                document.getElementById('avatar-letter').textContent = userName.charAt(0).toUpperCase();
                document.getElementById('profile-user-name').textContent = userName;
            } catch (error) {
                showToast('Ошибка: ' + error.message, 'error');
            }
        });
    }
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateTime(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}