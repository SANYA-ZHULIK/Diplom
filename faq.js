// faq.js - вопросы и ответы

async function loadFaq() {
    const client = window.supabaseClient;
    if (!client) {
        console.log('Waiting for Supabase...');
        setTimeout(loadFaq, 500);
        return;
    }
    
    try {
        const { data, error } = await client
            .from('faq')
            .select('*')
            .eq('is_active', true)
            .order('sort_order', { ascending: true });
            
        if (error) throw error;
        
        renderFaq(data || []);
    } catch (err) {
        console.error('Error loading FAQ:', err);
        const container = document.getElementById('faq-container');
        if (container) {
            container.innerHTML = '<div class="loading">Не удалось загрузить FAQ</div>';
        }
    }
}

function renderFaq(faqItems) {
    const container = document.getElementById('faq-container');
    if (!container) return;
    
    if (faqItems.length === 0) {
        container.innerHTML = '<div class="no-data">FAQ пока нет</div>';
        return;
    }
    
    // Группировка по категориям
    const grouped = {};
    faqItems.forEach(item => {
        const cat = item.category || 'general';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
    });
    
    const categoryLabels = {
        'general': 'Общие вопросы',
        'booking': 'Бронирование',
        'menu': 'Меню',
        'delivery': 'Доставка',
        'events': 'Мероприятия'
    };
    
    let html = '<div class="faq-grid">';
    
    for (const [category, items] of Object.entries(grouped)) {
        html += `
            <div class="faq-category">
                <h3 class="faq-category-title">${categoryLabels[category] || category}</h3>
                <div class="faq-list">
        `;
        
        items.forEach((item, index) => {
            html += `
                <div class="faq-item">
                    <div class="faq-question" onclick="toggleFaq(this)">
                        <span class="faq-question-text">${escapeHtml(item.question)}</span>
                        <span class="faq-icon">+</span>
                    </div>
                    <div class="faq-answer">
                        <p>${escapeHtml(item.answer)}</p>
                    </div>
                </div>
            `;
        });
        
        html += `</div></div>`;
    }
    
    html += '</div>';
    container.innerHTML = html;
}

function toggleFaq(element) {
    const item = element.closest('.faq-item');
    const answer = item.querySelector('.faq-answer');
    const icon = element.querySelector('.faq-icon');
    
    if (answer.style.display === 'block') {
        answer.style.display = 'none';
        icon.textContent = '+';
    } else {
        answer.style.display = 'block';
        icon.textContent = '−';
    }
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('faq-container')) {
        if (window.supabaseClient) {
            loadFaq();
        } else {
            const checkInterval = setInterval(() => {
                if (window.supabaseClient) {
                    clearInterval(checkInterval);
                    loadFaq();
                }
            }, 300);
        }
    }
});

window.toggleFaq = toggleFaq;