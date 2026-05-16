// cart.js
console.log('cart.js loading...');

let cartItems = [];

// Загрузка корзины из localStorage
function loadCart() {
    const saved = localStorage.getItem('restaurant_cart');
    console.log('Loading cart from localStorage:', saved);
    
    if (saved) {
        try {
            cartItems = JSON.parse(saved);
            console.log('Cart items loaded:', cartItems.length);
        } catch(e) {
            console.error('Error parsing cart:', e);
            cartItems = [];
        }
    } else {
        console.log('No saved cart found');
        cartItems = [];
    }
    
    // Обновляем UI после загрузки
    updateCartUI();
}

// Сохранение корзины
function saveCart() {
    localStorage.setItem('restaurant_cart', JSON.stringify(cartItems));
    console.log('Cart saved:', cartItems.length);
    updateCartUI();
}

// Добавление в корзину (глобальная функция)
window.addToCart = function(menuItem) {
    console.log('addToCart called:', menuItem);
    
    if (!menuItem || !menuItem.id) {
        console.error('Invalid menu item');
        return;
    }
    
    const existing = cartItems.find(item => item.id === menuItem.id);
    
    if (existing) {
        existing.quantity++;
        console.log('Increased quantity for', menuItem.name, 'new quantity:', existing.quantity);
    } else {
        cartItems.push({
            id: menuItem.id,
            name: menuItem.name,
            price: parseFloat(menuItem.price),
            photo_url: menuItem.photo_url || '',
            quantity: 1
        });
        console.log('Added new item:', menuItem.name);
    }
    
    saveCart();
    
    if (typeof showToast === 'function') {
        showToast(menuItem.name + ' добавлен в корзину', 'success');
    } else {
        alert(menuItem.name + ' добавлен в корзину');
    }
};

// Обновление количества
window.updateQuantity = function(id, delta) {
    const item = cartItems.find(i => i.id === id);
    if (item) {
        item.quantity += delta;
        if (item.quantity <= 0) {
            const index = cartItems.findIndex(i => i.id === id);
            cartItems.splice(index, 1);
        }
        saveCart();
    }
};

// Удаление из корзины
window.removeFromCart = function(id) {
    cartItems = cartItems.filter(i => i.id !== id);
    saveCart();
    if (typeof showToast === 'function') {
        showToast('Товар удалён из корзины', 'info');
    }
};

// Открыть корзину
window.openCart = function(e) {
    if (e) {
        e.preventDefault();
    }
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (sidebar) {
        sidebar.classList.add('open');
    }
    if (overlay) {
        overlay.classList.add('open');
    }
};

// Закрыть корзину
window.closeCart = function() {
    const sidebar = document.getElementById('cart-sidebar');
    const overlay = document.getElementById('cart-overlay');
    if (sidebar) {
        sidebar.classList.remove('open');
    }
    if (overlay) {
        overlay.classList.remove('open');
    }
};

// Обновление UI корзины
function updateCartUI() {
    console.log('updateCartUI called, items:', cartItems.length);
    
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    
    // Обновляем счетчик у ссылки в навигации
    const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const cartLink = document.getElementById('cart-nav-link');
    if (cartLink) {
        let existingCount = cartLink.querySelector('.cart-nav-count');
        if (totalItems > 0) {
            if (existingCount) {
                existingCount.textContent = totalItems;
            } else {
                const countSpan = document.createElement('span');
                countSpan.className = 'cart-nav-count';
                countSpan.textContent = totalItems;
                cartLink.appendChild(countSpan);
            }
        } else {
            if (existingCount) {
                existingCount.remove();
            }
        }
    }
    
    // Обновляем содержимое корзины
    if (cartItemsContainer) {
        if (cartItems.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="cart-empty">
                    <p>Корзина пуста</p>
                    <a href="/#menu" class="btn-small">Перейти в меню</a>
                </div>
            `;
        } else {
            cartItemsContainer.innerHTML = cartItems.map(item => `
                <div class="cart-item">
                    <img src="${getPhotoUrl(item.photo_url)}" alt="${escapeHtml(item.name)}" class="cart-item-img" onerror="this.src='photo_/no_photo.jpg'">
                    <div class="cart-item-info">
                        <div class="cart-item-name">${escapeHtml(item.name)}</div>
                        <div class="cart-item-price">${item.price} руб.</div>
                        <div class="cart-item-actions">
                            <button onclick="window.updateQuantity(${item.id}, -1)" class="cart-qty-btn">−</button>
                            <span class="cart-item-qty">${item.quantity}</span>
                            <button onclick="window.updateQuantity(${item.id}, 1)" class="cart-qty-btn">+</button>
                            <button onclick="window.removeFromCart(${item.id})" class="cart-remove-btn">Удалить</button>
                        </div>
                    </div>
                </div>
            `).join('');
        }
    }
    
    // Обновляем итоговую сумму
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    if (cartTotal) {
        cartTotal.textContent = total + ' руб.';
    }
}

// Оформление заказа
window.checkout = function() {
    if (cartItems.length === 0) {
        if (typeof showToast === 'function') {
            showToast('Корзина пуста', 'warning');
        }
        return;
    }
    
    if (typeof isAuthenticated !== 'undefined' && !isAuthenticated()) {
        if (typeof showToast === 'function') {
            showToast('Войдите в аккаунт для оформления заказа', 'warning');
        }
        if (typeof openAuthModal === 'function') {
            openAuthModal('login');
        }
        return;
    }
    
    openCheckoutModal();
};

// Открыть модальное окно оформления
function openCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (!modal) return;
    
    let user = null;
    if (typeof getCurrentUser === 'function') {
        user = getCurrentUser();
    }
    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const totalEl = document.getElementById('checkout-total');
    if (totalEl) totalEl.textContent = total + ' руб.';
    
    const nameInput = document.getElementById('checkout-name');
    if (nameInput) nameInput.value = user?.full_name || '';
    
    const phoneInput = document.getElementById('checkout-phone');
    if (phoneInput) phoneInput.value = user?.phone || '';
    
    const itemsList = document.getElementById('checkout-items-list');
    if (itemsList) {
        itemsList.innerHTML = cartItems.map(item => `
            <div class="checkout-item">
                <span>${escapeHtml(item.name)} x${item.quantity}</span>
                <span>${item.price * item.quantity} руб.</span>
            </div>
        `).join('');
    }
    
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
}

// Закрыть модальное окно
window.closeCheckoutModal = function() {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
};

// Отправка заказа
async function submitOrder(event) {
    event.preventDefault();
    
    const client = window.supabaseClient;
    if (!client) {
        if (typeof showToast === 'function') showToast('Ошибка соединения', 'error');
        return;
    }
    
    let user = null;
    if (typeof getCurrentUser === 'function') {
        user = getCurrentUser();
    }
    
    const name = document.getElementById('checkout-name').value.trim();
    const phone = document.getElementById('checkout-phone').value.trim();
    const orderType = document.getElementById('checkout-type').value;
    const notes = document.getElementById('checkout-notes').value.trim();
    
    if (!name || !phone) {
        if (typeof showToast === 'function') showToast('Заполните имя и телефон', 'warning');
        return;
    }
    
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const orderNumber = 'ORD-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    
    const btn = document.querySelector('#checkout-form button[type="submit"]');
    if (btn) {
        btn.disabled = true;
        btn.textContent = 'Оформление...';
    }
    
    try {
        const { data: order, error: orderError } = await client
            .from('orders')
            .insert({
                order_number: orderNumber,
                customer_name: name,
                customer_phone: phone,
                order_type: orderType,
                status: 'pending',
                subtotal: subtotal,
                total_amount: subtotal,
                notes: notes || null,
                created_at: new Date().toISOString()
            })
            .select()
            .single();
            
        if (orderError) throw orderError;
        
        const orderItems = cartItems.map(item => ({
            order_id: order.id,
            menu_item_id: item.id,
            quantity: item.quantity,
            unit_price: item.price,
            status: 'pending'
        }));
        
        const { error: itemsError } = await client
            .from('order_items')
            .insert(orderItems);
            
        if (itemsError) throw itemsError;
        
        cartItems = [];
        saveCart();
        
        if (typeof showToast === 'function') {
            showToast('Заказ успешно оформлен!', 'success');
        }
        closeCheckoutModal();
        closeCart();
        
        setTimeout(() => {
            if (confirm('Заказ оформлен! Перейти в личный кабинет для отслеживания?')) {
                window.location.href = '/profile.html';
            }
        }, 1000);
        
    } catch (err) {
        console.error('Order error:', err);
        if (typeof showToast === 'function') {
            showToast('Ошибка оформления: ' + (err.message || err), 'error');
        }
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = 'Оформить заказ';
        }
    }
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function getPhotoUrl(relativePath) {
    if (!relativePath) return 'photo_/no_photo.jpg';
    const baseUrl = typeof SUPABASE_URL !== 'undefined' ? SUPABASE_URL : '';
    const encodedPath = encodeURIComponent(relativePath).replace(/%2F/g, '/');
    return `${baseUrl}/storage/v1/object/public/menu-images/${encodedPath}`;
}

// Инициализация при загрузке DOM
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM ready, initializing cart...');
    
    // Создаем HTML корзины
    if (!document.getElementById('cart-sidebar')) {
        const cartSidebarHtml = `
            <div id="cart-sidebar" class="cart-sidebar">
                <div class="cart-header">
                    <h3>Корзина</h3>
                    <button class="cart-close" onclick="window.closeCart()">×</button>
                </div>
                <div id="cart-items" class="cart-items"></div>
                <div class="cart-footer">
                    <div class="cart-total">
                        <span>Итого:</span>
                        <span id="cart-total">0 руб.</span>
                    </div>
                    <button class="btn-primary checkout-btn" onclick="window.checkout()">Оформить заказ</button>
                </div>
            </div>
            <div id="cart-overlay" class="cart-overlay" onclick="window.closeCart()"></div>
        `;
        document.body.insertAdjacentHTML('beforeend', cartSidebarHtml);
    }
    
    // Создаем модальное окно оформления
    if (!document.getElementById('checkout-modal')) {
        const checkoutModalHtml = `
            <div id="checkout-modal" class="modal">
                <div class="modal-content checkout-modal-content">
                    <span class="close-modal" onclick="window.closeCheckoutModal()">&times;</span>
                    <h3>Оформление заказа</h3>
                    <form id="checkout-form">
                        <div class="form-group">
                            <label>Ваше имя *</label>
                            <input type="text" id="checkout-name" required>
                        </div>
                        <div class="form-group">
                            <label>Телефон *</label>
                            <input type="tel" id="checkout-phone" required>
                        </div>
                        <div class="form-group">
                            <label>Тип заказа</label>
                            <select id="checkout-type">
                                <option value="dine_in">В ресторане</option>
                                <option value="takeaway">С собой</option>
                                <option value="delivery">Доставка</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Состав заказа</label>
                            <div id="checkout-items-list" class="checkout-items-list"></div>
                        </div>
                        <div class="form-group">
                            <label>Итого к оплате</label>
                            <div class="checkout-total" id="checkout-total">0 руб.</div>
                        </div>
                        <div class="form-group">
                            <label>Комментарий к заказу</label>
                            <textarea id="checkout-notes" rows="2" placeholder="Особые пожелания..."></textarea>
                        </div>
                        <button type="submit" class="btn-primary">Оформить заказ</button>
                    </form>
                </div>
            </div>
        `;
        document.body.insertAdjacentHTML('beforeend', checkoutModalHtml);
        
        const form = document.getElementById('checkout-form');
        if (form) {
            form.addEventListener('submit', submitOrder);
        }
    }
    
    // Добавляем обработчик для ссылки корзины
    const cartLink = document.getElementById('cart-nav-link');
    if (cartLink) {
        cartLink.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            window.openCart();
        });
    }
    
    // Загружаем корзину из localStorage
    loadCart();
});