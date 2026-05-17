// admin-employees.js
let allEmployees = [];
let editingEmployeeId = null;

function getClient() { return window.supabaseClient; }

// Загрузка сотрудников
async function loadEmployees() {
    const client = getClient();
    if (!client) return;

    try {
        const { data, error } = await client
            .from('employees')
            .select('*')
            .order('last_name');

        if (error) throw error;

        allEmployees = (data || []).map(emp => ({
            ...emp,
            id: Number(emp.id)
        }));

        renderEmployeesList();
    } catch (err) {
        console.error('Error loading employees:', err);
        showToast('Ошибка загрузки сотрудников', 'error');
    }
}

// Отрисовка списка сотрудников
function renderEmployeesList() {
    const container = document.getElementById('employees-list');
    if (!container) return;

    const search = document.getElementById('employees-search')?.value.toLowerCase() || '';

    let filtered = allEmployees;
    if (search) {
        filtered = filtered.filter(emp => 
            emp.first_name.toLowerCase().includes(search) ||
            emp.last_name.toLowerCase().includes(search) ||
            (emp.position && emp.position.toLowerCase().includes(search)) ||
            (emp.email && emp.email.toLowerCase().includes(search))
        );
    }

    if (filtered.length === 0) {
        container.innerHTML = '<div class="no-data">Нет сотрудников</div>';
        return;
    }

    container.innerHTML = `
        <table class="employees-table">
            <thead>
                <tr>
                    <th>ФИО</th>
                    <th>Должность</th>
                    <th>Телефон</th>
                    <th>Email</th>
                    <th>Дата приема</th>
                    <th>Статус</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                ${filtered.map(emp => `
                    <tr>
                        <td><strong>${escapeHtml(emp.last_name)} ${escapeHtml(emp.first_name)}</strong></td>
                        <td>${escapeHtml(emp.position || '—')}</td>
                        <td>${escapeHtml(emp.phone || '—')}</td>
                        <td>${escapeHtml(emp.email || '—')}</td>
                        <td>${emp.hire_date ? formatDate(emp.hire_date) : '—'}</td>
                        <td>
                            <span class="employee-status ${emp.is_active ? 'active' : 'inactive'}">
                                ${emp.is_active ? 'Работает' : 'Уволен'}
                            </span>
                        </td>
                        <td class="employee-actions">
                            <button onclick="editEmployee(${emp.id})" class="btn-action btn-edit">Ред.</button>
                            <button onclick="toggleEmployeeStatus(${emp.id}, ${emp.is_active})" class="btn-action ${emp.is_active ? 'btn-hide' : 'btn-show'}">
                                ${emp.is_active ? 'Уволить' : 'Восстановить'}
                            </button>
                            <button onclick="deleteEmployee(${emp.id})" class="btn-action btn-delete">Удалить</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU');
}

// Показать форму добавления
window.showAddEmployeeForm = function() {
    editingEmployeeId = null;
    document.getElementById('employee-modal-title').textContent = 'Добавить сотрудника';
    document.getElementById('employee-form').reset();
    document.getElementById('employee-is-active').checked = true;
    document.getElementById('employee-modal').style.display = 'block';
};

// Редактирование
window.editEmployee = function(id) {
    const emp = allEmployees.find(e => e.id === id);
    if (!emp) return;

    editingEmployeeId = id;
    document.getElementById('employee-modal-title').textContent = 'Редактировать сотрудника';
    document.getElementById('employee-first-name').value = emp.first_name || '';
    document.getElementById('employee-last-name').value = emp.last_name || '';
    document.getElementById('employee-position').value = emp.position || '';
    document.getElementById('employee-phone').value = emp.phone || '';
    document.getElementById('employee-email').value = emp.email || '';
    document.getElementById('employee-hire-date').value = emp.hire_date || '';
    document.getElementById('employee-is-active').checked = emp.is_active;
    document.getElementById('employee-modal').style.display = 'block';
};

// Сохранение
async function saveEmployee(event) {
    event.preventDefault();
    const client = getClient();
    if (!client) return;

    const firstName = document.getElementById('employee-first-name').value.trim();
    const lastName = document.getElementById('employee-last-name').value.trim();
    const position = document.getElementById('employee-position').value.trim() || null;
    const phone = document.getElementById('employee-phone').value.trim() || null;
    const email = document.getElementById('employee-email').value.trim() || null;
    const hireDate = document.getElementById('employee-hire-date').value || null;
    const isActive = document.getElementById('employee-is-active').checked;

    if (!firstName || !lastName) {
        showToast('Заполните имя и фамилию', 'warning');
        return;
    }

    const btn = document.querySelector('#employee-form button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Сохранение...';

    const employeeData = {
        first_name: firstName,
        last_name: lastName,
        position,
        phone,
        email,
        hire_date: hireDate,
        is_active: isActive
    };

    try {
        if (editingEmployeeId) {
            const { error } = await client
                .from('employees')
                .update(employeeData)
                .eq('id', editingEmployeeId);
            if (error) throw error;
            showToast('Сотрудник обновлён', 'success');
        } else {
            const { error } = await client
                .from('employees')
                .insert([employeeData]);
            if (error) throw error;
            showToast('Сотрудник добавлен', 'success');
        }

        closeEmployeeModal();
        await loadEmployees();
    } catch (err) {
        console.error('Save error:', err);
        showToast('Ошибка: ' + (err.message || err), 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Сохранить';
    }
}

// Переключение статуса
window.toggleEmployeeStatus = async function(id, currentStatus) {
    const client = getClient();
    if (!client) return;

    const newStatus = !currentStatus;
    const action = newStatus ? 'Восстановить' : 'Уволить';
    
    if (confirm(`${action} сотрудника?`)) {
        try {
            const { error } = await client
                .from('employees')
                .update({ is_active: newStatus })
                .eq('id', id);
            if (error) throw error;
            showToast(currentStatus ? 'Сотрудник уволен' : 'Сотрудник восстановлен', 'success');
            await loadEmployees();
        } catch (err) {
            showToast('Ошибка: ' + (err.message || err), 'error');
        }
    }
};

// Удаление
window.deleteEmployee = async function(id) {
    if (!confirm('Удалить сотрудника? Это действие нельзя отменить.')) return;

    const client = getClient();
    if (!client) return;

    try {
        const { error } = await client
            .from('employees')
            .delete()
            .eq('id', id);
        if (error) throw error;

        showToast('Сотрудник удалён', 'success');
        await loadEmployees();
    } catch (err) {
        console.error('Delete error:', err);
        showToast('Ошибка удаления', 'error');
    }
};

function closeEmployeeModal() {
    document.getElementById('employee-modal').style.display = 'none';
    editingEmployeeId = null;
}

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Фильтрация
function setupEmployeesFilters() {
    const searchInput = document.getElementById('employees-search');
    if (searchInput) {
        searchInput.addEventListener('input', () => renderEmployeesList());
    }
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('employees-list')) {
        const addBtn = document.getElementById('add-employee-btn');
        if (addBtn) addBtn.addEventListener('click', showAddEmployeeForm);

        const modal = document.getElementById('employee-modal');
        if (modal) {
            const closeBtn = modal.querySelector('.close-modal');
            if (closeBtn) closeBtn.addEventListener('click', closeEmployeeModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeEmployeeModal();
            });
        }

        const form = document.getElementById('employee-form');
        if (form) form.addEventListener('submit', saveEmployee);

        setupEmployeesFilters();
        loadEmployees();
    }
});