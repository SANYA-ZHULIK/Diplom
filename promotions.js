// promotions.js - акции

async function loadPromotions() {
    console.log('loadPromotions started');
    
    const client = window.supabaseClient;
    if (!client) {
        console.log('Waiting for Supabase...');
        setTimeout(loadPromotions, 500);
        return;
    }
    
    try {
        const today = new Date().toISOString().split('T')[0];
        console.log('Today:', today);
        
        // Получаем все активные акции (уберем фильтр по датам для теста)
        const { data, error } = await client
            .from('promotions')
            .select('*')
            .eq('is_active', true);
            // .lte('start_date', today)
            // .gte('end_date', today)
            
        if (error) throw error;
        
        console.log('Promotions loaded:', data);
        console.log('Promotions count:', data ? data.length : 0);
        
        if (data && data.length > 0) {
            renderPromotions(data);
        } else {
            const container = document.getElementById('promotions-container');
            if (container) {
                container.innerHTML = '<div class="no-promotions">Нет активных акций</div>';
            }
        }
    } catch (err) {
        console.error('Error loading promotions:', err);
        const container = document.getElementById('promotions-container');
        if (container) {
            container.innerHTML = '<div class="no-promotions">Ошибка загрузки акций: ' + (err.message || err) + '</div>';
        }
    }
}

function renderPromotions(promotions) {
    const container = document.getElementById('promotions-container');
    if (!container) return;
    
    if (promotions.length === 0) {
        container.innerHTML = '<div class="no-promotions">Следите за новостями — скоро появятся новые акции!</div>';
        return;
    }
    
    container.innerHTML = promotions.map(promo => {
        let discountHtml = '';
        let badgeClass = '';
        
        if (promo.discount_type === 'percentage') {
            discountHtml = `<div class="promotion-discount">-${promo.discount_value}%</div>`;
            badgeClass = 'discount-percent';
        } else if (promo.discount_type === 'fixed') {
            discountHtml = `<div class="promotion-discount">Подарок</div>`;
            badgeClass = 'discount-gift';
        } else if (promo.discount_type === 'buy_one_get_one') {
            discountHtml = `<div class="promotion-discount">2+1</div>`;
            badgeClass = 'discount-bogo';
        }
        
        let conditionHtml = '';
        if (promo.min_order_amount && promo.min_order_amount > 0) {
            conditionHtml = `<div class="promotion-condition">от ${promo.min_order_amount} руб.</div>`;
        }
        
        return `
            <div class="promotion-card ${badgeClass}">
                ${discountHtml}
                <div class="promotion-content">
                    <h4 class="promotion-title">${escapeHtml(promo.title)}</h4>
                    <p class="promotion-description">${escapeHtml(promo.description || '')}</p>
                    ${conditionHtml}
                    <div class="promotion-dates">
                        до ${formatDate(promo.end_date)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' });
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Запускаем после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, checking for promotions container');
    
    // Проверяем наличие контейнера
    const container = document.getElementById('promotions-container');
    if (container) {
        console.log('Promotions container found, waiting for Supabase...');
        
        // Ждём Supabase
        const waitForSupabase = setInterval(() => {
            if (window.supabaseClient) {
                console.log('Supabase client ready');
                clearInterval(waitForSupabase);
                loadPromotions();
            }
        }, 200);
        
        // Таймаут на всякий случай
        setTimeout(() => {
            if (!window.supabaseClient) {
                clearInterval(waitForSupabase);
                container.innerHTML = '<div class="no-promotions">Ошибка подключения к базе данных</div>';
            }
        }, 10000);
        
    } else {
        console.error('Promotions container NOT found in DOM!');
    }
});