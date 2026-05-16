// admin-suppliers.js
let allSuppliers = [];
let editingSupplierId = null;

function getClient() { return window.supabaseClient; }

// Загрузка списка поставщиков
async function loadSuppliers() {
    const client = getClient();
    if (!client) return;

    try {
        const { data, error } = await client
            .from('suppliers')
            .select('*')
            .order('name');

        if (error) throw error;

        allSuppliers = (data || []).map(supplier => ({
            ...supplier,
            id: Number(supplier.id)
        }));

        renderSuppliersList();
    } catch (err) {
        console.error('Error loading suppliers:', err);
        showToast('Ошибка загрузки поставщиков', 'error');
    }
}

// Отрисовка списка поставщиков
// Отрисовка списка поставщиков (таблицей на всю ширину)
// Отрисовка списка поставщиков (таблицей на всю ширину)
function renderSuppliersList() {
    const container = document.getElementById('suppliers-list');
    if (!container) return;

    const search = document.getElementById('suppliers-search')?.value.toLowerCase() || '';

    let filtered = allSuppliers;
    if (search) {
        filtered = filtered.filter(supplier => 
            supplier.name.toLowerCase().includes(search) ||
            (supplier.contact_person && supplier.contact_person.toLowerCase().includes(search)) ||
            (supplier.email && supplier.email.toLowerCase().includes(search)) ||
            (supplier.phone && supplier.phone.includes(search))
        );
    }

    if (filtered.length === 0) {
        container.innerHTML = '<div class="no-data">Нет поставщиков</div>';
        return;
    }

    container.innerHTML = `
        <table class="suppliers-table">
            <thead>
                <tr>
                    <th>Название</th>
                    <th>Контактное лицо</th>
                    <th>Телефон</th>
                    <th>Email</th>
                    <th>Адрес</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                ${filtered.map(supplier => `
                    <tr>
                        <td class="supplier-name">${escapeHtml(supplier.name)}</td>
                        <td class="supplier-contact-person">${escapeHtml(supplier.contact_person || '—')}</td>
                        <td class="supplier-phone">${escapeHtml(supplier.phone || '—')}</td>
                        <td class="supplier-email">${escapeHtml(supplier.email || '—')}</td>
                        <td class="supplier-address">${escapeHtml(supplier.address || '—')}</td>
                        <td class="supplier-actions">
                            <button onclick="editSupplier(${supplier.id})" class="btn-action btn-edit">Редактировать</button>
                            <button onclick="deleteSupplier(${supplier.id})" class="btn-action btn-delete">Удалить</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// Показать форму добавления
window.showAddSupplierForm = function() {
    editingSupplierId = null;
    document.getElementById('supplier-modal-title').textContent = 'Добавить поставщика';
    document.getElementById('supplier-form').reset();
    document.getElementById('supplier-modal').style.display = 'block';
};

// Редактирование поставщика
window.editSupplier = function(id) {
    const supplier = allSuppliers.find(s => s.id === id);
    if (!supplier) return;

    editingSupplierId = id;
    document.getElementById('supplier-modal-title').textContent = 'Редактировать поставщика';
    document.getElementById('supplier-name').value = supplier.name || '';
    document.getElementById('supplier-contact-person').value = supplier.contact_person || '';
    document.getElementById('supplier-phone').value = supplier.phone || '';
    document.getElementById('supplier-email').value = supplier.email || '';
    document.getElementById('supplier-address').value = supplier.address || '';
    document.getElementById('supplier-modal').style.display = 'block';
};

// Сохранение поставщика
async function saveSupplier(event) {
    event.preventDefault();
    const client = getClient();
    if (!client) return;

    const name = document.getElementById('supplier-name').value.trim();
    const contactPerson = document.getElementById('supplier-contact-person').value.trim() || null;
    const phone = document.getElementById('supplier-phone').value.trim() || null;
    const email = document.getElementById('supplier-email').value.trim() || null;
    const address = document.getElementById('supplier-address').value.trim() || null;

    if (!name) {
        showToast('Введите название поставщика', 'warning');
        return;
    }

    // Валидация email если указан
    if (email && !isValidEmail(email)) {
        showToast('Введите корректный email', 'warning');
        return;
    }

    const btn = document.querySelector('#supplier-form button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Сохранение...';

    const supplierData = {
        name,
        contact_person: contactPerson,
        phone,
        email,
        address
    };

    try {
        if (editingSupplierId) {
            const { error } = await client
                .from('suppliers')
                .update(supplierData)
                .eq('id', editingSupplierId);
            if (error) throw error;
            showToast('Поставщик обновлён', 'success');
        } else {
            const { error } = await client
                .from('suppliers')
                .insert([supplierData]);
            if (error) throw error;
            showToast('Поставщик добавлен', 'success');
        }

        closeSupplierModal();
        await loadSuppliers();
    } catch (err) {
        console.error('Save supplier error:', err);
        showToast('Ошибка: ' + (err.message || err), 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Сохранить';
    }
}

// Удаление поставщика
window.deleteSupplier = async function(id) {
    if (!confirm('Удалить этого поставщика? Это действие нельзя отменить.')) return;

    const client = getClient();
    if (!client) return;

    try {
        const { error } = await client
            .from('suppliers')
            .delete()
            .eq('id', id);
        if (error) throw error;

        showToast('Поставщик удалён', 'success');
        await loadSuppliers();
    } catch (err) {
        console.error('Delete supplier error:', err);
        showToast('Ошибка удаления: ' + (err.message || err), 'error');
    }
};

function closeSupplierModal() {
    document.getElementById('supplier-modal').style.display = 'none';
    editingSupplierId = null;
}

function isValidEmail(email) {
    const re = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    return re.test(email);
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Фильтрация в админке
function setupSuppliersFilters() {
    const searchInput = document.getElementById('suppliers-search');
    if (searchInput) {
        searchInput.addEventListener('input', () => renderSuppliersList());
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('suppliers-list')) {
        const addBtn = document.getElementById('add-supplier-btn');
        if (addBtn) addBtn.addEventListener('click', showAddSupplierForm);

        const modal = document.getElementById('supplier-modal');
        if (modal) {
            const closeBtn = modal.querySelector('.close-modal');
            if (closeBtn) closeBtn.addEventListener('click', closeSupplierModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeSupplierModal();
            });
        }

        const form = document.getElementById('supplier-form');
        if (form) form.addEventListener('submit', saveSupplier);

        setupSuppliersFilters();
        loadSuppliers();
    }
});