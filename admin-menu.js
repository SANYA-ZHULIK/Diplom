// admin-menu.js
let allMenuItems = [];
let editingDishId = null;

function getClient() { return window.supabaseClient; }

function getPhotoUrl(relativePath) {
    if (!relativePath) return 'photo_/no_photo.jpg';
    const baseUrl = SUPABASE_URL;
    const encodedPath = encodeURIComponent(relativePath).replace(/%2F/g, '/');
    return `${baseUrl}/storage/v1/object/public/menu-images/${encodedPath}`;
}

// Генерация безопасного имени файла
function generateSafeFileName(dishName, category, ext) {
    const timestamp = Date.now();
    const map = {
        'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z','и':'i',
        'й':'y','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r','с':'s','т':'t',
        'у':'u','ф':'f','х':'kh','ц':'ts','ч':'ch','ш':'sh','щ':'shch','ъ':'','ы':'y',
        'ь':'','э':'e','ю':'yu','я':'ya'
    };
    const translit = (s) => s.toLowerCase().split('').map(ch => map[ch] || ch).join('').replace(/[^a-z0-9]/g, '_');
    const safeCategory = translit(category) || 'uncategorized';
    const safeName = translit(dishName);
    return `${safeCategory}/${safeName}_${timestamp}.jpg`;
}

// Сжатие изображения
function compressImage(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ratio = Math.min(1, maxWidth / img.width);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                canvas.toBlob((blob) => {
                    resolve(new File([blob], file.name, { type: 'image/jpeg' }));
                }, 'image/jpeg', quality);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// Загрузка фото в Storage
async function uploadDishImage(file, dishName, category) {
    const client = getClient();
    if (!client) throw new Error('Supabase not initialized');

    const compressedFile = await compressImage(file, 800, 0.7);
    const fileName = generateSafeFileName(dishName, category, 'jpg');

    const { data, error } = await client.storage
        .from('menu-images')
        .upload(fileName, compressedFile, { upsert: true });

    if (error) throw error;
    return fileName;
}

// Загрузка списка блюд
async function loadMenuItems() {
    const client = getClient();
    if (!client) return;

    try {
        const { data, error } = await client
            .from('menu_items')
            .select('*')
            .order('category')
            .order('name');

        if (error) throw error;

        allMenuItems = (data || []).map(item => ({
            ...item,
            id: Number(item.id),
            price: String(item.price),
            is_active: !!item.is_active
        }));

        renderMenuList();
    } catch (err) {
        console.error('Error loading menu:', err);
        showToast('Ошибка загрузки меню', 'error');
    }
}

// Отрисовка списка блюд в админке
function renderMenuList() {
    const container = document.getElementById('menu-list');
    if (!container) return;

    const search = document.getElementById('menu-search')?.value.toLowerCase() || '';
    const category = document.getElementById('category-filter')?.value || '';

    let filtered = allMenuItems;
    if (search) {
        filtered = filtered.filter(item => item.name.toLowerCase().includes(search));
    }
    if (category) {
        filtered = filtered.filter(item => item.category === category);
    }

    if (filtered.length === 0) {
        container.innerHTML = '<div class="no-data">Нет блюд в меню</div>';
        return;
    }

    container.innerHTML = filtered.map(item => `
        <div class="menu-item-admin" data-id="${item.id}">
            <div class="menu-item-photo">
                <img src="${getPhotoUrl(item.photo_url)}" alt="${escapeHtml(item.name)}">
            </div>
            <div class="menu-item-info">
                <div class="menu-item-name">${escapeHtml(item.name)}</div>
                <div class="menu-item-category">${escapeHtml(item.category)}</div>
                <div class="menu-item-price">${item.price} руб.</div>
                <div class="menu-item-status ${item.is_active ? 'active' : 'inactive'}">
                    ${item.is_active ? 'Активно' : 'Скрыто'}
                </div>
            </div>
            <div class="menu-item-actions">
                <button onclick="editDish(${item.id})" class="btn-action btn-edit">Редактировать</button>
                <button onclick="toggleDishStatus(${item.id}, ${item.is_active})" class="btn-action ${item.is_active ? 'btn-hide' : 'btn-show'}">
                    ${item.is_active ? 'Скрыть' : 'Показать'}
                </button>
                <button onclick="deleteDish(${item.id})" class="btn-action btn-delete">Удалить</button>
            </div>
        </div>
    `).join('');
}

// Показать форму добавления
window.showAddDishForm = function() {
    editingDishId = null;
    document.getElementById('dish-modal-title').textContent = 'Добавить блюдо';
    document.getElementById('dish-form').reset();
    document.getElementById('dish-is-active').checked = true;
    document.getElementById('photo-preview').innerHTML = '<img src="photo_/no_photo.jpg" alt="Preview">';
    document.getElementById('dish-modal').style.display = 'block';
};

// Редактирование блюда
window.editDish = function(id) {
    const dish = allMenuItems.find(d => d.id === id);
    if (!dish) return;

    editingDishId = id;
    document.getElementById('dish-modal-title').textContent = 'Редактировать блюдо';
    document.getElementById('dish-name').value = dish.name;
    document.getElementById('dish-category').value = dish.category;
    document.getElementById('dish-description').value = dish.description || '';
    document.getElementById('dish-price').value = dish.price;
    document.getElementById('dish-is-active').checked = dish.is_active;

    const preview = document.getElementById('photo-preview');
    if (dish.photo_url) {
        preview.innerHTML = `<img src="${getPhotoUrl(dish.photo_url)}" alt="Preview">`;
        preview.dataset.existingPhoto = dish.photo_url;
    } else {
        preview.innerHTML = '<img src="photo_/no_photo.jpg" alt="Preview">';
        delete preview.dataset.existingPhoto;
    }

    document.getElementById('dish-modal').style.display = 'block';
};

// Сохранение блюда
async function saveDish(event) {
    event.preventDefault();
    const client = getClient();
    if (!client) return;

    const name = document.getElementById('dish-name').value.trim();
    const category = document.getElementById('dish-category').value;
    const description = document.getElementById('dish-description').value.trim();
    const price = parseInt(document.getElementById('dish-price').value, 10);
    const isActive = document.getElementById('dish-is-active').checked;
    const photoInput = document.getElementById('dish-photo');

    if (!name || !category || isNaN(price)) {
        showToast('Заполните название, категорию и цену', 'warning');
        return;
    }

    const btn = document.querySelector('#dish-form button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Сохранение...';

    try {
        let photo_url = editingDishId ? allMenuItems.find(d => d.id === editingDishId)?.photo_url : null;

        // Загрузка нового фото
        if (photoInput.files[0]) {
            photo_url = await uploadDishImage(photoInput.files[0], name, category);
        }

        const dishData = {
            name,
            category,
            description: description || null,
            price: price.toString(),
            is_active: isActive,
            photo_url: photo_url || null
        };

        if (editingDishId) {
            const { error } = await client
                .from('menu_items')
                .update(dishData)
                .eq('id', editingDishId);
            if (error) throw error;
            showToast('Блюдо обновлено', 'success');
        } else {
            const { error } = await client
                .from('menu_items')
                .insert([dishData]);
            if (error) throw error;
            showToast('Блюдо добавлено', 'success');
        }

        closeDishModal();
        await loadMenuItems();
    } catch (err) {
        console.error('Save error:', err);
        showToast('Ошибка: ' + (err.message || err), 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Сохранить';
    }
}

// Удаление блюда
window.deleteDish = async function(id) {
    if (!confirm('Удалить это блюдо?')) return;

    const client = getClient();
    if (!client) return;

    try {
        // Получаем фото для удаления
        const dish = allMenuItems.find(d => d.id === id);
        
        // Удаляем из БД
        const { error } = await client
            .from('menu_items')
            .delete()
            .eq('id', id);
        if (error) throw error;

        // Удаляем фото из Storage, если есть
        if (dish?.photo_url) {
            await client.storage.from('menu-images').remove([dish.photo_url]);
        }

        showToast('Блюдо удалено', 'success');
        await loadMenuItems();
    } catch (err) {
        console.error('Delete error:', err);
        showToast('Ошибка удаления', 'error');
    }
};

// Переключение статуса
window.toggleDishStatus = async function(id, currentStatus) {
    const client = getClient();
    if (!client) return;

    try {
        const { error } = await client
            .from('menu_items')
            .update({ is_active: !currentStatus })
            .eq('id', id);
        if (error) throw error;
        showToast(currentStatus ? 'Блюдо скрыто' : 'Блюдо показано', 'success');
        await loadMenuItems();
    } catch (err) {
        showToast('Ошибка: ' + (err.message || err), 'error');
    }
};

function closeDishModal() {
    document.getElementById('dish-modal').style.display = 'none';
    editingDishId = null;
}

// Настройка превью фото
function setupPhotoPreview() {
    const photoInput = document.getElementById('dish-photo');
    if (!photoInput) return;

    photoInput.addEventListener('change', function() {
        const file = this.files[0];
        const preview = document.getElementById('photo-preview');
        const fileNameDisplay = document.getElementById('file-name-display');
        
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
            };
            reader.readAsDataURL(file);
            if (fileNameDisplay) fileNameDisplay.textContent = file.name;
        } else {
            preview.innerHTML = '<img src="photo_/no_photo.jpg" alt="Preview">';
            if (fileNameDisplay) fileNameDisplay.textContent = '';
        }
    });
}

// Фильтрация в админке
function setupMenuFilters() {
    const searchInput = document.getElementById('menu-search');
    const categoryFilter = document.getElementById('category-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', () => renderMenuList());
    }
    if (categoryFilter) {
        categoryFilter.addEventListener('change', () => renderMenuList());
    }
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('menu-list')) {
        const addBtn = document.getElementById('add-dish-btn');
        if (addBtn) addBtn.addEventListener('click', showAddDishForm);

        const modal = document.getElementById('dish-modal');
        if (modal) {
            const closeBtn = modal.querySelector('.close-modal');
            if (closeBtn) closeBtn.addEventListener('click', closeDishModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeDishModal();
            });
        }

        const form = document.getElementById('dish-form');
        if (form) form.addEventListener('submit', saveDish);

        setupPhotoPreview();
        setupMenuFilters();
        loadMenuItems();
    }
});