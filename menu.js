// menu.js
let allMenuItems = [];

async function loadMenuFromDB() {
    const client = window.supabaseClient;
    if (!client) {
        console.log('Waiting for Supabase client...');
        setTimeout(loadMenuFromDB, 300);
        return;
    }

    try {
        console.log('Loading menu items from DB...');
        const { data, error } = await client
            .from('menu_items')
            .select('*')
            .eq('is_active', true)
            .order('category')
            .order('name');

        if (error) throw error;

        allMenuItems = data || [];
        console.log('Loaded menu items:', allMenuItems.length);
        
        const activeBtn = document.querySelector('.menu-category.active');
        const activeCategory = activeBtn ? activeBtn.dataset.category : 'Салаты';
        
        renderMenuItems(allMenuItems, activeCategory);
    } catch (err) {
        console.error('Error loading menu:', err);
        const container = document.getElementById('dynamic-menu');
        if (container) {
            container.innerHTML = '<div class="no-data">Ошибка загрузки меню: ' + (err.message || err) + '</div>';
        }
    }
}

function getPhotoUrl(relativePath) {
    if (!relativePath) return 'photo_/no_photo.jpg';
    const baseUrl = SUPABASE_URL;
    const encodedPath = encodeURIComponent(relativePath).replace(/%2F/g, '/');
    return `${baseUrl}/storage/v1/object/public/menu-images/${encodedPath}`;
}

function renderMenuItems(items, activeCategory = null) {
    const container = document.getElementById('dynamic-menu');
    if (!container) {
        console.log('Container #dynamic-menu not found');
        return;
    }

    if (!items || items.length === 0) {
        container.innerHTML = '<div class="no-data">Нет блюд в меню. Добавьте блюда через админ-панель.</div>';
        return;
    }

    if (!activeCategory) {
        const activeBtn = document.querySelector('.menu-category.active');
        activeCategory = activeBtn ? activeBtn.dataset.category : 'Салаты';
    }

    const grouped = {};
    items.forEach(item => {
        const cat = item.category || 'Без категории';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
    });

    let html = '';
    for (const [category, categoryItems] of Object.entries(grouped)) {
        const displayStyle = category === activeCategory ? 'block' : 'none';
        html += `<div class="menu-category-group" data-category="${category}" style="display: ${displayStyle}">`;
        html += `<h3 class="category-title">${escapeHtml(category)}</h3>`;
        html += `<div class="menu-items-grid">`;

        categoryItems.forEach(item => {
            const photoUrl = getPhotoUrl(item.photo_url);
            html += `
                <div class="menu-item-card">
                    <div class="menu-item-photo">
                        <img src="${photoUrl}" alt="${escapeHtml(item.name)}" loading="lazy" onerror="this.src='photo_/no_photo.jpg'">
                    </div>
                    <div class="menu-item-info">
                        <h4>${escapeHtml(item.name)}</h4>
                        <p class="menu-item-desc">${escapeHtml(item.description || '')}</p>
                        <div class="menu-item-price">${item.price} руб.</div>
                        <button class="btn-add-to-cart" data-id="${item.id}" data-name="${escapeHtml(item.name)}" data-price="${item.price}" data-photo="${item.photo_url || ''}">
                            В корзину
                        </button>
                    </div>
                </div>
            `;
        });

        html += `</div></div>`;
    }

    container.innerHTML = html;
    
    // Обработчики для кнопок "В корзину"
    const cartButtons = document.querySelectorAll('.btn-add-to-cart');
    console.log('Found cart buttons:', cartButtons.length);
    
    cartButtons.forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const id = parseInt(this.dataset.id);
            const name = this.dataset.name;
            const price = parseFloat(this.dataset.price);
            const photo_url = this.dataset.photo;
            
            console.log('Add to cart clicked:', {id, name, price});
            
            if (typeof window.addToCart === 'function') {
                window.addToCart({ id, name, price, photo_url });
            } else {
                console.error('addToCart function not found!');
                alert('Ошибка: корзина не загружена. Обновите страницу.');
            }
        });
    });
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function filterMenuByCategory(category) {
    const groups = document.querySelectorAll('.menu-category-group');
    if (!groups.length) return;
    
    groups.forEach(group => {
        if (group.dataset.category === category) {
            group.style.display = 'block';
        } else {
            group.style.display = 'none';
        }
    });
}