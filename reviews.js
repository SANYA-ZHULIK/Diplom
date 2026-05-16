// reviews.js - упрощённая версия без модерации
let allReviews = [];

function getClient() { return window.supabaseClient; }

// Загрузка всех отзывов
async function loadReviews() {
    const client = getClient();
    if (!client) {
        setTimeout(loadReviews, 500);
        return;
    }

    try {
        const { data, error } = await client
            .from('reviews')
            .select(`
                *,
                profiles:profile_id (full_name)
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        
        allReviews = data || [];
        renderReviews();
    } catch (err) {
        console.error('Error loading reviews:', err);
        const container = document.getElementById('reviews-container');
        if (container) {
            container.innerHTML = '<div class="no-reviews">Ошибка загрузки отзывов</div>';
        }
    }
}

// Рендер отзывов
function renderReviews() {
    const container = document.getElementById('reviews-container');
    if (!container) return;

    if (allReviews.length === 0) {
        container.innerHTML = '<div class="no-reviews">Пока нет отзывов. Будьте первым!</div>';
        return;
    }

    container.innerHTML = allReviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <div class="review-author">
                    <div class="review-avatar">
                        ${(review.profiles?.full_name || 'Гость').charAt(0).toUpperCase()}
                    </div>
                    <div class="review-info">
                        <div class="review-name">${escapeHtml(review.profiles?.full_name || 'Гость')}</div>
                        <div class="review-date">${formatDate(review.created_at)}</div>
                    </div>
                </div>
                <div class="review-rating">${renderStars(review.rating)}</div>
            </div>
            <div class="review-content">
                <p>${escapeHtml(review.comment)}</p>
            </div>
        </div>
    `).join('');
}

// Рендер звезд
function renderStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<span class="star ${i <= rating ? 'filled' : ''}">★</span>`;
    }
    return stars;
}

// Форматирование даты
function formatDate(dateStr) {
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    });
}

// Проверка, может ли пользователь оставить отзыв (есть ли завершённые бронирования)
// Проверка, может ли пользователь оставить отзыв
async function canUserReview() {
    if (!isAuthenticated()) return false;

    const client = getClient();
    if (!client) return false;

    try {
        const user = getCurrentUser();
        
        // Проверяем, есть ли уже отзыв от этого пользователя
        const { data: existingReview, error: reviewError } = await client
            .from('reviews')
            .select('id')
            .eq('profile_id', user.id)
            .limit(1);

        if (reviewError) throw reviewError;
        
        if (existingReview && existingReview.length > 0) {
            showToast('Вы уже оставляли отзыв. Спасибо!', 'info');
            return false;
        }
        
        // Проверяем есть ли завершённые бронирования
        const { data: bookings, error: bookingError } = await client
            .from('bookings')
            .select('id')
            .eq('user_id', user.id)
            .eq('status', 'completed')
            .limit(1);

        if (bookingError) throw bookingError;
        
        if (!bookings || bookings.length === 0) {
            showToast('Оставить отзыв могут только гости с завершёнными бронированиями', 'warning');
            return false;
        }
        
        return true;
    } catch (err) {
        console.error('Error checking review eligibility:', err);
        return false;
    }
}

// Показать форму отзыва
async function showReviewForm() {
    const canReview = await canUserReview();
    
    if (!canReview) {
        if (!isAuthenticated()) {
            openAuthModal('login');
        } else {
            showToast('Оставить отзыв могут только гости с завершёнными бронированиями', 'warning');
        }
        return;
    }

    const modal = document.getElementById('review-modal');
    if (modal) {
        document.getElementById('review-rating').value = '5';
        document.getElementById('review-comment').value = '';
        updateStarPreview(5);
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }
}

// Обновление превью звезд
function updateStarPreview(rating) {
    const stars = document.querySelectorAll('#review-star-preview .star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('filled');
        } else {
            star.classList.remove('filled');
        }
    });
}

// Отправка отзыва
async function submitReview(event) {
    event.preventDefault();

    const rating = parseInt(document.getElementById('review-rating').value);
    const comment = document.getElementById('review-comment').value.trim();

    if (!comment) {
        showToast('Пожалуйста, напишите отзыв', 'warning');
        return;
    }

    if (comment.length < 5) {
        showToast('Отзыв должен содержать минимум 5 символов', 'warning');
        return;
    }

    const client = getClient();
    if (!client) return;

    const user = getCurrentUser();
    if (!user) {
        showToast('Необходимо войти в систему', 'warning');
        return;
    }

    const btn = document.querySelector('#review-form button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Отправка...';

    try {
        const reviewData = {
            user_id: user.id,
            profile_id: user.id,
            rating: rating,
            comment: comment,
            status: 'approved'  // Сразу одобрен
        };

        const { error } = await client
            .from('reviews')
            .insert([reviewData]);

        if (error) throw error;

        showToast('Спасибо за отзыв!', 'success');
        closeReviewModal();
        
        // Обновляем список отзывов
        await loadReviews();
        
    } catch (err) {
        console.error('Error submitting review:', err);
        showToast('Ошибка: ' + (err.message || err), 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Отправить отзыв';
    }
}

function closeReviewModal() {
    const modal = document.getElementById('review-modal');
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Настройка звезд в форме
function setupStarRating() {
    const stars = document.querySelectorAll('#review-star-preview .star');
    const ratingInput = document.getElementById('review-rating');
    
    stars.forEach((star, index) => {
        star.addEventListener('click', () => {
            ratingInput.value = index + 1;
            updateStarPreview(index + 1);
        });
        
        star.addEventListener('mouseenter', () => {
            stars.forEach((s, i) => {
                if (i <= index) {
                    s.classList.add('hover');
                } else {
                    s.classList.remove('hover');
                }
            });
        });
        
        star.addEventListener('mouseleave', () => {
            stars.forEach(s => s.classList.remove('hover'));
        });
    });
}

// Инициализация
function initReviews() {
    loadReviews();
    
    const modal = document.getElementById('review-modal');
    if (modal) {
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.addEventListener('click', closeReviewModal);
        }
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeReviewModal();
        });
    }
    
    const form = document.getElementById('review-form');
    if (form) {
        form.addEventListener('submit', submitReview);
    }
    
    setupStarRating();
}

// Запускаем после загрузки страницы
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('reviews-container')) {
        // Ждём Supabase
        if (window.supabaseClient) {
            initReviews();
        } else {
            const checkInterval = setInterval(() => {
                if (window.supabaseClient) {
                    clearInterval(checkInterval);
                    initReviews();
                }
            }, 300);
        }
    }
});

// Глобальные функции
window.showReviewForm = showReviewForm;
window.closeReviewModal = closeReviewModal;