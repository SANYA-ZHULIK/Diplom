// === УПРАВЛЕНИЕ АВТОРИЗАЦИЕЙ ===

var isRegistering = false; // Флаг для предотвращения двойной обработки

document.addEventListener('DOMContentLoaded', async function() {
    // Ждем инициализации Supabase из supabase.js
    var attempts = 0;
    while (!supabaseClient && attempts < 50) {
        await new Promise(function(resolve) { setTimeout(resolve, 100); });
        attempts++;
    }
    
    await checkAuth();
    updateUI();
    setupAuthListener();
});

async function checkAuth() {
    if (!supabaseClient) {
        console.log('Supabase не инициализирован');
        return;
    }
    
    try {
        var result = await supabaseClient.auth.getSession();
        if (result.data && result.data.session) {
            currentUser = result.data.session.user;
            await loadUserProfile();
        }
    } catch (err) {
        console.error('Ошибка проверки авторизации:', err);
    }
}

async function loadUserProfile() {
    if (!currentUser || !supabaseClient) return;
    
    try {
        var result = await supabaseClient
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
        
        if (!result.error) {
            currentProfile = result.data;
            isAdmin = result.data && result.data.role === 'admin';
        }
        
        updateUI();
        
        if (typeof loadProfileData === 'function') {
            loadProfileData();
        }
        
        if (typeof loadAdminData === 'function' && isAdmin) {
            loadAdminData();
        }
        
    } catch (err) {
        console.error('Ошибка загрузки профиля:', err);
    }
}

function updateUI() {
    var authButtons = document.getElementById('authButtons');
    var userMenu = document.getElementById('userMenu');
    var profileLink = document.getElementById('profileLink');
    var adminLink = document.getElementById('adminLink');
    var userEmail = document.getElementById('userEmail');
    
    if (currentUser) {
        if (authButtons) authButtons.classList.add('hidden');
        if (userMenu) userMenu.classList.remove('hidden');
        if (profileLink) profileLink.classList.remove('hidden');
        if (userEmail) userEmail.textContent = currentUser.email;
        if (adminLink && isAdmin) adminLink.classList.remove('hidden');
    } else {
        if (authButtons) authButtons.classList.remove('hidden');
        if (userMenu) userMenu.classList.add('hidden');
        if (profileLink) profileLink.classList.add('hidden');
        if (adminLink) adminLink.classList.add('hidden');
    }
}

async function handleRegister(event) {
    event.preventDefault();
    
    if (!supabaseClient) {
        showNotification('Ошибка: Supabase не инициализирован', 'error');
        return;
    }
    
    var email = document.getElementById('registerEmail').value;
    var password = document.getElementById('registerPassword').value;
    var fullName = document.getElementById('registerName').value;
    var phone = document.getElementById('registerPhone').value;
    var errorElement = document.getElementById('registerError');
    
    errorElement.textContent = '';
    
    try {
        isRegistering = true; // Устанавливаем флаг
        
        var result = await supabaseClient.auth.signUp({
            email: email,
            password: password
        });
        
        if (result.error) {
            isRegistering = false;
            errorElement.textContent = result.error.message;
            return;
        }
        
        if (result.data && result.data.user) {
            var profileResult = await supabaseClient
                .from('profiles')
                .insert({
                    id: result.data.user.id,
                    full_name: fullName,
                    phone: phone,
                    role: 'user',
                    bonus_balance: 0
                });
            
            if (profileResult.error && profileResult.error.code !== '23505') {
                console.error('Ошибка создания профиля:', profileResult.error);
            }
        }
        
        // Сбрасываем флаг через небольшую задержку
        setTimeout(function() { isRegistering = false; }, 2000);
        
        hideModal('registerModal');
        document.body.style.overflow = '';
        showNotification('Регистрация успешна! Проверьте email для подтверждения.', 'success');
        document.getElementById('registerForm').reset();
        
    } catch (err) {
        console.error('Ошибка регистрации:', err);
        errorElement.textContent = 'Произошла ошибка при регистрации';
    }
}

async function handleLogin(event) {
    event.preventDefault();
    
    if (!supabaseClient) {
        showNotification('Ошибка: Supabase не инициализирован', 'error');
        return;
    }
    
    var email = document.getElementById('loginEmail').value;
    var password = document.getElementById('loginPassword').value;
    var errorElement = document.getElementById('loginError');
    
    errorElement.textContent = '';
    
    try {
        var result = await supabaseClient.auth.signInWithPassword({
            email: email,
            password: password
        });
        
        if (result.error) {
            errorElement.textContent = 'Неверный email или пароль';
            return;
        }
        
        currentUser = result.data.user;
        await loadUserProfile();
        
        hideModal('loginModal');
        document.body.style.overflow = '';
        showNotification('Вход выполнен успешно!', 'success');
        document.getElementById('loginForm').reset();
        
    } catch (err) {
        console.error('Ошибка входа:', err);
        errorElement.textContent = 'Произошла ошибка при входе';
    }
}

async function logout() {
    if (!supabaseClient) return;
    
    try {
        await supabaseClient.auth.signOut();
        
        currentUser = null;
        currentProfile = null;
        isAdmin = false;
        
        updateUI();
        showNotification('Вы вышли из системы', 'info');
        
        if (window.location.pathname.includes('profile.html') ||
            window.location.pathname.includes('admin.html')) {
            window.location.href = 'index.html';
        }
        
    } catch (err) {
        console.error('Ошибка выхода:', err);
    }
}

function checkPageAccess() {
    var isProfilePage = window.location.pathname.includes('profile.html');
    var isAdminPage = window.location.pathname.includes('admin.html');
    
    if (isProfilePage && !currentUser) {
        var authMsg = document.getElementById('authMessage');
        var profileContent = document.getElementById('profileContent');
        if (authMsg) authMsg.classList.remove('hidden');
        if (profileContent) profileContent.classList.add('hidden');
        return false;
    }
    
    if (isProfilePage && currentUser) {
        var authMsg = document.getElementById('authMessage');
        var profileContent = document.getElementById('profileContent');
        if (authMsg) authMsg.classList.add('hidden');
        if (profileContent) profileContent.classList.remove('hidden');
        return true;
    }
    
    if (isAdminPage && !isAdmin) {
        var authMsg = document.getElementById('authMessage');
        var adminContent = document.getElementById('adminContent');
        if (authMsg) authMsg.classList.remove('hidden');
        if (adminContent) adminContent.classList.add('hidden');
        return false;
    }
    
    if (isAdminPage && isAdmin) {
        var authMsg = document.getElementById('authMessage');
        var adminContent = document.getElementById('adminContent');
        if (authMsg) authMsg.classList.add('hidden');
        if (adminContent) adminContent.classList.remove('hidden');
        return true;
    }
    
    return true;
}

function setupAuthListener() {
    if (!supabaseClient) {
        setTimeout(setupAuthListener, 500);
        return;
    }
    
    supabaseClient.auth.onAuthStateChange(function(event, session) {
        console.log('Auth event:', event);
        
        // Игнорируем события если только что регистрировались
        if (isRegistering && event === 'SIGNED_IN') {
            isRegistering = false;
            return;
        }
        
        if (event === 'SIGNED_IN' && session) {
            currentUser = session.user;
            loadUserProfile();
        } else if (event === 'SIGNED_OUT') {
            currentUser = null;
            currentProfile = null;
            isAdmin = false;
            updateUI();
        }
    });
}
