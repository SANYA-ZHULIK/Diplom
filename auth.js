// ==========================================
// ПРОСТАЯ АВТОРИЗАЦИЯ (только через таблицу profiles)
// ==========================================

let currentUser = null;

// Функция для простого хэширования пароля
function hashPassword(password) {
    let hash = 0;
    for (let i = 0; i < password.length; i++) {
        const char = password.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

// Инициализация
async function initAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            updateAuthUI();
            // Проверяем актуальность данных из БД
            await refreshCurrentUser();
        } catch(e) {
            localStorage.removeItem('currentUser');
        }
    }
    updateAuthUI();
}

// Обновить данные текущего пользователя из БД
async function refreshCurrentUser() {
    if (!currentUser || !currentUser.id) return;
    
    const client = window.supabaseClient;
    if (!client) return;
    
    try {
        const { data, error } = await client
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
        
        if (error) throw error;
        
        if (data) {
            currentUser = {
                id: data.id,
                email: data.email,
                full_name: data.full_name,
                phone: data.phone
            };
            localStorage.setItem('currentUser', JSON.stringify(currentUser));
            updateAuthUI();
        }
    } catch(e) {
        console.error('Error refreshing user:', e);
    }
}

function getCurrentUser() {
    return currentUser;
}

function isAuthenticated() {
    return currentUser !== null;
}

// Регистрация
async function registerUser(email, password, fullName, phone) {
    const client = window.supabaseClient;
    if (!client) throw new Error('Supabase не инициализирован');

    // Проверяем, существует ли пользователь с таким email
    const { data: existing } = await client
        .from('profiles')
        .select('id')
        .eq('email', email);

    if (existing && existing.length > 0) {
        throw new Error('Пользователь с таким email уже существует');
    }

    // Создаём нового пользователя в таблице profiles
    const { data, error } = await client
        .from('profiles')
        .insert({
            id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
            email: email,
            full_name: fullName,
            phone: phone || null,
            password: hashPassword(password),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        })
        .select()
        .single();

    if (error) throw new Error(error.message);

    return { user: data };
}

// Вход
async function loginUser(email, password) {
    const client = window.supabaseClient;
    if (!client) throw new Error('Supabase не инициализирован');

    const hashedPassword = hashPassword(password);

    const { data, error } = await client
        .from('profiles')
        .select('*')
        .eq('email', email)
        .eq('password', hashedPassword);

    if (error) throw new Error('Ошибка при входе');
    
    if (!data || data.length === 0) {
        throw new Error('Неверный email или пароль');
    }

    const userData = data[0];

    currentUser = {
        id: userData.id,
        email: userData.email,
        full_name: userData.full_name,
        phone: userData.phone
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateAuthUI();
    
    return { user: currentUser };
}

// Выход
async function logoutUser() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    updateAuthUI();
    showToast('Вы вышли из системы', 'info');
    setTimeout(() => window.location.reload(), 500);
}

// Обновление UI
function updateAuthUI() {
    const authButtons = document.getElementById('auth-buttons');
    const userMenu = document.getElementById('user-menu');
    
    if (isAuthenticated()) {
        const userName = currentUser?.full_name || currentUser?.email?.split('@')[0] || 'Пользователь';
        
        if (userMenu) {
            userMenu.innerHTML = `
                <div class="user-dropdown">
                    <button class="user-menu-btn">
                        <span class="user-avatar">${userName.charAt(0).toUpperCase()}</span>
                        <span>${userName}</span>
                        <span class="arrow">▼</span>
                    </button>
                    <div class="user-dropdown-content">
                        <a href="#" onclick="loadProfilePage(); return false;">Мои бронирования</a>
                        <hr>
                        <button onclick="logoutUser()">Выйти</button>
                    </div>
                </div>
            `;
            userMenu.style.display = 'flex';
        }
        
        if (authButtons) {
            authButtons.style.display = 'none';
        }
    } else {
        if (userMenu) {
            userMenu.style.display = 'none';
        }
        
        if (authButtons) {
            authButtons.innerHTML = `
                <button class="btn-login" onclick="openAuthModal('login')">Войти</button>
                <button class="btn-register" onclick="openAuthModal('register')">Регистрация</button>
            `;
            authButtons.style.display = 'flex';
        }
    }
}

// Загрузка броней пользователя
async function getUserBookings(limit = 50) {
    if (!isAuthenticated()) return [];
    
    const client = window.supabaseClient;
    if (!client) return [];
    
    const { data, error } = await client
        .from('bookings')
        .select('*, tables:table_id(number, seats)')
        .eq('user_id', currentUser.id)
        .order('date', { ascending: false })
        .limit(limit);
    
    if (error) {
        console.error('Error loading bookings:', error);
        return [];
    }
    
    return data || [];
}

// Загрузка профиля пользователя
async function getUserProfile() {
    if (!isAuthenticated()) return null;
    return currentUser;
}

// Обновление профиля
async function updateUserProfile(updates) {
    const client = window.supabaseClient;
    if (!client || !isAuthenticated()) throw new Error('Не авторизован');
    
    const { error } = await client
        .from('profiles')
        .update({
            ...updates,
            updated_at: new Date().toISOString()
        })
        .eq('id', currentUser.id);
    
    if (error) throw new Error(error.message);
    
    currentUser = { ...currentUser, ...updates };
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateAuthUI();
}

// ==========================================
// МОДАЛЬНОЕ ОКНО АВТОРИЗАЦИИ
// ==========================================

let authModal = null;
let currentAuthMode = 'login';

function createAuthModal() {
    if (authModal) return;

    authModal = document.createElement('div');
    authModal.id = 'auth-modal';
    authModal.className = 'auth-modal';
    authModal.innerHTML = `
        <div class="auth-modal-content">
            <span class="auth-close-btn">&times;</span>
            
            <div class="auth-tabs">
                <button class="auth-tab active" data-mode="login">Войти</button>
                <button class="auth-tab" data-mode="register">Регистрация</button>
            </div>

            <form id="login-form" class="auth-form">
                <div id="login-error" class="auth-error" style="display: none;"></div>
                <div class="form-group">
                    <label for="login-email">Email</label>
                    <input type="email" id="login-email" required placeholder="example@mail.com">
                </div>
                <div class="form-group">
                    <label for="login-password">Пароль</label>
                    <input type="password" id="login-password" required minlength="4">
                </div>
                <button type="submit" class="btn-primary">Войти</button>
            </form>

            <form id="register-form" class="auth-form" style="display: none;">
                <div id="register-error" class="auth-error" style="display: none;"></div>
                <div class="form-group">
                    <label for="register-name">Имя</label>
                    <input type="text" id="register-name" required minlength="2" placeholder="Иван Иванов">
                </div>
                <div class="form-group">
                    <label for="register-email">Email</label>
                    <input type="email" id="register-email" required placeholder="example@mail.com">
                </div>
                <div class="form-group">
                    <label for="register-phone">Телефон (опционально)</label>
                    <input type="tel" id="register-phone" placeholder="+375 29 123-45-67">
                </div>
                <div class="form-group">
                    <label for="register-password">Пароль</label>
                    <input type="password" id="register-password" required minlength="4" placeholder="Минимум 4 символа">
                </div>
                <div class="form-group">
                    <label for="register-confirm-password">Подтвердите пароль</label>
                    <input type="password" id="register-confirm-password" required minlength="4">
                </div>
                <button type="submit" class="btn-primary">Зарегистрироваться</button>
            </form>
        </div>
    `;

    document.body.appendChild(authModal);
    setupAuthEventListeners();
}

function setupAuthEventListeners() {
    const closeBtn = authModal.querySelector('.auth-close-btn');
    closeBtn.addEventListener('click', closeAuthModal);

    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) closeAuthModal();
    });

    const tabs = authModal.querySelectorAll('.auth-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => switchAuthMode(tab.dataset.mode));
    });

    const loginForm = authModal.querySelector('#login-form');
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        const errorEl = document.getElementById('login-error');
        
        try {
            await loginUser(email, password);
            closeAuthModal();
            showToast('Добро пожаловать!', 'success');
            setTimeout(() => window.location.reload(), 500);
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.style.display = 'block';
        }
    });

    const registerForm = authModal.querySelector('#register-form');
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fullName = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const phone = document.getElementById('register-phone').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;
        const errorEl = document.getElementById('register-error');
        
        if (password !== confirmPassword) {
            errorEl.textContent = 'Пароли не совпадают';
            errorEl.style.display = 'block';
            return;
        }
        
        if (password.length < 4) {
            errorEl.textContent = 'Пароль должен быть не менее 4 символов';
            errorEl.style.display = 'block';
            return;
        }
        
        try {
            await registerUser(email, password, fullName, phone);
            closeAuthModal();
            showToast('Регистрация успешна! Теперь войдите', 'success');
        } catch (err) {
            errorEl.textContent = err.message;
            errorEl.style.display = 'block';
        }
    });
}

function openAuthModal(mode = 'login') {
    createAuthModal();
    authModal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    switchAuthMode(mode);
}

function closeAuthModal() {
    if (authModal) {
        authModal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function switchAuthMode(mode) {
    currentAuthMode = mode;
    const tabs = authModal.querySelectorAll('.auth-tab');
    tabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.mode === mode);
    });

    const loginForm = authModal.querySelector('#login-form');
    const registerForm = authModal.querySelector('#register-form');
    
    loginForm.style.display = mode === 'login' ? 'block' : 'none';
    registerForm.style.display = mode === 'register' ? 'block' : 'none';
}

// ==========================================
// ОСНОВНАЯ ФУНКЦИЯ ЗАГРУЗКИ ПРОФИЛЯ - ИСПРАВЛЕНА
// ==========================================

async function loadProfilePage() {
    if (!isAuthenticated()) {
        openAuthModal('login');
        return;
    }
    
    // Перенаправляем на отдельную страницу профиля
    window.location.href = '/profile.html';
}

// Функция для переключения режима редактирования профиля
function toggleEditProfile() {
    const form = document.getElementById('profile-edit-form');
    const btn = document.getElementById('profile-edit-btn');
    
    if (form && btn) {
        if (form.style.display === 'none' || !form.style.display) {
            form.style.display = 'block';
            btn.style.display = 'none';
        } else {
            form.style.display = 'none';
            btn.style.display = 'inline-block';
        }
    }
}

// Добавление колонки password (если её нет)
async function ensurePasswordColumn() {
    const client = window.supabaseClient;
    if (!client) return;
    
    try {
        const { data } = await client.from('profiles').select('password').limit(1);
        if (!data) {
            console.log('Password column check - continuing...');
        }
    } catch(e) {
        console.warn('⚠️ В таблице profiles нет колонки password. Добавьте через SQL Editor:');
        console.warn('ALTER TABLE profiles ADD COLUMN IF NOT EXISTS password TEXT;');
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    initAuth();
    ensurePasswordColumn();
});

// Обработчик формы редактирования профиля
document.addEventListener('DOMContentLoaded', () => {
    const editForm = document.getElementById('profile-edit-form');
    if (editForm) {
        editForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const fullName = document.getElementById('edit-full-name')?.value || '';
            const phone = document.getElementById('edit-phone')?.value || '';
            
            try {
                await updateUserProfile({ full_name: fullName, phone: phone });
                showToast('Профиль обновлён', 'success');
                toggleEditProfile();
                await loadProfilePage();
            } catch (error) {
                showToast('Ошибка: ' + error.message, 'error');
            }
        });
    }
});

window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.logoutUser = logoutUser;
window.isAuthenticated = isAuthenticated;
window.getCurrentUser = getCurrentUser;
window.loadProfilePage = loadProfilePage;
window.toggleEditProfile = toggleEditProfile;