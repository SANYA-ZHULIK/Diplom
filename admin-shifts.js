// admin-shifts.js
let allShifts = [];
let allEmployeesSimple = [];
let editingShiftId = null;

function getClient() { return window.supabaseClient; }

// Загрузка сотрудников для выпадающего списка
async function loadEmployeesForSelect() {
    const client = getClient();
    if (!client) return;

    try {
        const { data, error } = await client
            .from('employees')
            .select('id, first_name, last_name')
            .eq('is_active', true)
            .order('last_name');

        if (error) throw error;
        allEmployeesSimple = data || [];
        
        const select = document.getElementById('shift-employee-id');
        if (select) {
            select.innerHTML = '<option value="">Выберите сотрудника</option>' + 
                allEmployeesSimple.map(emp => 
                    `<option value="${emp.id}">${escapeHtml(emp.last_name)} ${escapeHtml(emp.first_name)}</option>`
                ).join('');
        }
    } catch (err) {
        console.error('Error loading employees for select:', err);
    }
}

// Загрузка смен
async function loadShifts() {
    const client = getClient();
    if (!client) return;

    try {
        const { data, error } = await client
            .from('employee_shifts')
            .select(`
                *,
                employees:employee_id (first_name, last_name)
            `)
            .order('work_date', { ascending: false })
            .order('start_time');

        if (error) throw error;

        allShifts = (data || []).map(shift => ({
            ...shift,
            id: Number(shift.id),
            employee_id: Number(shift.employee_id)
        }));

        renderShiftsList();
    } catch (err) {
        console.error('Error loading shifts:', err);
        showToast('Ошибка загрузки смен', 'error');
    }
}

// Отрисовка списка смен
function renderShiftsList() {
    const container = document.getElementById('shifts-list');
    if (!container) return;

    const search = document.getElementById('shifts-search')?.value.toLowerCase() || '';
    const dateFilter = document.getElementById('shifts-date-filter')?.value || '';

    let filtered = allShifts;
    if (search) {
        filtered = filtered.filter(shift => 
            (shift.employees?.first_name && shift.employees.first_name.toLowerCase().includes(search)) ||
            (shift.employees?.last_name && shift.employees.last_name.toLowerCase().includes(search))
        );
    }
    if (dateFilter) {
        filtered = filtered.filter(shift => shift.work_date === dateFilter);
    }

    if (filtered.length === 0) {
        container.innerHTML = '<div class="no-data">Нет смен</div>';
        return;
    }

    container.innerHTML = `
        <table class="shifts-table">
            <thead>
                <tr>
                    <th>Дата</th>
                    <th>Сотрудник</th>
                    <th>Начало</th>
                    <th>Конец</th>
                    <th>Длительность</th>
                    <th>Примечание</th>
                    <th>Действия</th>
                </tr>
            </thead>
            <tbody>
                ${filtered.map(shift => {
                    const duration = calculateDuration(shift.start_time, shift.end_time);
                    return `
                        <tr>
                            <td>${formatDate(shift.work_date)}</td>
                            <td><strong>${escapeHtml(shift.employees?.last_name || '')} ${escapeHtml(shift.employees?.first_name || '')}</strong></td>
                            <td>${shift.start_time}</td>
                            <td>${shift.end_time}</td>
                            <td>${duration} ч.</td>
                            <td>${escapeHtml(shift.notes || '—')}</td>
                            <td class="shift-actions">
                                <button onclick="editShift(${shift.id})" class="btn-action btn-edit">Ред.</button>
                                <button onclick="deleteShift(${shift.id})" class="btn-action btn-delete">Удалить</button>
                            </td>
                        </td>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

function calculateDuration(startTime, endTime) {
    if (!startTime || !endTime) return '—';
    
    const startParts = startTime.split(':');
    const endParts = endTime.split(':');
    
    let startHours = parseInt(startParts[0]);
    let startMinutes = parseInt(startParts[1]);
    let endHours = parseInt(endParts[0]);
    let endMinutes = parseInt(endParts[1]);
    
    // Если время окончания меньше времени начала (переход через полночь)
    if (endHours < startHours || (endHours === startHours && endMinutes < startMinutes)) {
        endHours += 24;
    }
    
    let totalMinutes = (endHours * 60 + endMinutes) - (startHours * 60 + startMinutes);
    let hours = Math.floor(totalMinutes / 60);
    let minutes = totalMinutes % 60;
    
    return hours + (minutes > 0 ? '.' + minutes : '');
}

function formatDate(dateStr) {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('ru-RU');
}

// Показать форму добавления смены
window.showAddShiftForm = function() {
    editingShiftId = null;
    document.getElementById('shift-modal-title').textContent = 'Добавить смену';
    document.getElementById('shift-form').reset();
    document.getElementById('shift-work-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('shift-modal').style.display = 'block';
};

// Редактирование смены
window.editShift = function(id) {
    const shift = allShifts.find(s => s.id === id);
    if (!shift) return;

    editingShiftId = id;
    document.getElementById('shift-modal-title').textContent = 'Редактировать смену';
    document.getElementById('shift-employee-id').value = shift.employee_id;
    document.getElementById('shift-work-date').value = shift.work_date;
    document.getElementById('shift-start-time').value = shift.start_time;
    document.getElementById('shift-end-time').value = shift.end_time;
    document.getElementById('shift-notes').value = shift.notes || '';
    document.getElementById('shift-modal').style.display = 'block';
};

// Сохранение смены
async function saveShift(event) {
    event.preventDefault();
    const client = getClient();
    if (!client) return;

    const employeeId = parseInt(document.getElementById('shift-employee-id').value);
    const workDate = document.getElementById('shift-work-date').value;
    const startTime = document.getElementById('shift-start-time').value;
    const endTime = document.getElementById('shift-end-time').value;
    const notes = document.getElementById('shift-notes').value.trim() || null;

    if (!employeeId || !workDate || !startTime || !endTime) {
        showToast('Заполните все обязательные поля', 'warning');
        return;
    }

    const btn = document.querySelector('#shift-form button[type="submit"]');
    btn.disabled = true;
    btn.textContent = 'Сохранение...';

    const shiftData = {
        employee_id: employeeId,
        work_date: workDate,
        start_time: startTime,
        end_time: endTime,
        notes: notes
    };

    try {
        if (editingShiftId) {
            const { error } = await client
                .from('employee_shifts')
                .update(shiftData)
                .eq('id', editingShiftId);
            if (error) throw error;
            showToast('Смена обновлена', 'success');
        } else {
            const { error } = await client
                .from('employee_shifts')
                .insert([shiftData]);
            if (error) throw error;
            showToast('Смена добавлена', 'success');
        }

        closeShiftModal();
        await loadShifts();
    } catch (err) {
        console.error('Save shift error:', err);
        showToast('Ошибка: ' + (err.message || err), 'error');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Сохранить';
    }
}

// Удаление смены
window.deleteShift = async function(id) {
    if (!confirm('Удалить эту смену?')) return;

    const client = getClient();
    if (!client) return;

    try {
        const { error } = await client
            .from('employee_shifts')
            .delete()
            .eq('id', id);
        if (error) throw error;

        showToast('Смена удалена', 'success');
        await loadShifts();
    } catch (err) {
        console.error('Delete shift error:', err);
        showToast('Ошибка удаления', 'error');
    }
};

function closeShiftModal() {
    document.getElementById('shift-modal').style.display = 'none';
    editingShiftId = null;
}

function setupShiftsFilters() {
    const searchInput = document.getElementById('shifts-search');
    const dateFilter = document.getElementById('shifts-date-filter');
    
    if (searchInput) {
        searchInput.addEventListener('input', () => renderShiftsList());
    }
    if (dateFilter) {
        dateFilter.addEventListener('change', () => renderShiftsList());
    }
}

function setupEmployeesSubTabs() {
    const subtabs = document.querySelectorAll('.employees-subtab');
    const contents = document.querySelectorAll('.employees-subtab-content');
    
    subtabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.subtab;
            subtabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            contents.forEach(c => c.classList.remove('active'));
            document.getElementById(target + '-subtab').classList.add('active');
            
            if (target === 'employee-shifts') {
                loadShifts();
                loadEmployeesForSelect();
            }
        });
    });
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('shifts-list')) {
        setupEmployeesSubTabs();
        
        const addBtn = document.getElementById('add-shift-btn');
        if (addBtn) addBtn.addEventListener('click', showAddShiftForm);

        const modal = document.getElementById('shift-modal');
        if (modal) {
            const closeBtn = modal.querySelector('.close-modal');
            if (closeBtn) closeBtn.addEventListener('click', closeShiftModal);
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeShiftModal();
            });
        }

        const form = document.getElementById('shift-form');
        if (form) form.addEventListener('submit', saveShift);

        setupShiftsFilters();
    }
});

function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}