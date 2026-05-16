// promotions.js - акции (лаконичная версия)

async function loadPromotions() {
    const client = window.supabaseClient;
    if (!client) {
        setTimeout(loadPromotions, 500);
        return;
    }
    
    try {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await client
            .from('promotions')
            .select('*')
            .eq('is_active', true)
            .lte('start_date', today)
            .gte('end_date', today)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        
        renderPromotions(data || []);
    } catch (err) {
        console.error('Error loading promotions:', err);
        const container = document.getElementById('promotions-container');
        if (container) {
            container.innerHTML = '<div class="loading">Не удалось загрузить акции</div>';
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
            conditionHtml = `<div class="promotion-condition">от ${promo.min_order_amount} ₽</div>`;
        }
        
        return `
            <div class="promotion-card ${badgeClass}">
                ${discountHtml}
                <div class="promotion-content">
                    <h4 class="promotion-title">${escapeHtml(promo.title)}</h4>
                    <p class="promotion-description">${escapeHtml(promo.description || '')}</p>
                    ${conditionHtml}
                    <div class="promotion-dates">
                        <span class="date-icon">📅</span> до ${formatDate(promo.end_date)}
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

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('promotions-container')) {
        if (window.supabaseClient) {
            loadPromotions();
        } else {
            const checkInterval = setInterval(() => {
                if (window.supabaseClient) {
                    clearInterval(checkInterval);
                    loadPromotions();
                }
            }, 300);
        }
    }
});