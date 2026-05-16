/* Admin Panel - Simplified Auth (Hardcoded)
   Email: admin@restaurant.com
   Password: admin123
*/

let allTables = [], allBookings = [], editingBookingId = null;
const ADMIN_EMAIL = 'admin@restaurant.com', ADMIN_PASSWORD = 'admin123';

function getClient() { return window.supabaseClient; }
function isAdminLoggedIn() { return sessionStorage.getItem('adminLoggedIn') === 'true'; }
function setAdminLoggedIn(v) { v ? sessionStorage.setItem('adminLoggedIn','true') : sessionStorage.removeItem('adminLoggedIn'); }
// Header scroll effect for admin panel
function initAdminHeaderScroll() {
    const header = document.querySelector('header');
    if (!header) return;

    let ticking = false, isScrolled = false;

    function updateHeaderOnScroll() {
        const scrollY = window.scrollY;
        if (scrollY < 100) {
            if (isScrolled) {
                isScrolled = false;
                header.style.background = 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)';
                header.style.boxShadow = 'none';
            }
        } else if (!isScrolled) {
            isScrolled = true;
            header.style.background = 'linear-gradient(to bottom, rgba(212, 165, 116, 0.9) 0%, rgba(212, 165, 116, 0.85) 100%)';
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,0.15)';
        }
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(updateHeaderOnScroll);
            ticking = true;
        }
    }, { passive: true });
    updateHeaderOnScroll();
}

// Вызвать после загрузки страницы
document.addEventListener('DOMContentLoaded', initAdminHeaderScroll);
function showAdminPanel() {
    document.getElementById('login-container').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'block';
}
function showLoginForm() {
    hideLoading();
    document.getElementById('login-container').style.display = 'block';
    document.getElementById('admin-panel').style.display = 'none';
}
function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'flex';
}
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.style.display = 'none';
}

function loginAdmin(e) {
    e.preventDefault(); e.stopPropagation();
    const email = document.getElementById('admin-email').value.trim();
    const pass = document.getElementById('admin-password').value;
    if (!email||!pass) return showToast('Введите email и пароль','warning');
    if (email===ADMIN_EMAIL && pass===ADMIN_PASSWORD) {
        setAdminLoggedIn(true);
        showToast('Вход выполнен','success');
        showAdminPanel();
        waitForSupabaseAndLoad();
    } else {
        showToast('Неверный email или пароль','error');
        const eI=document.getElementById('admin-email'), pI=document.getElementById('admin-password');
        eI.value=''; pI.value=''; eI.focus();
    }
}

function logoutAdmin() {
    setAdminLoggedIn(false);
    hideLoading();
    showLoginForm();
    showToast('Вы вышли','info');
}

function waitForSupabaseAndLoad() {
    const maxWait=10000, start=Date.now();
    console.log('Waiting for Supabase client...');
    showLoading();
    const timer=setInterval(()=>{
        console.log('Checking supabaseClient...', !!window.supabaseClient);
        if(window.supabaseClient){
            clearInterval(timer);
            console.log('Supabase ready, loading data');
            loadAllData();
            setupRealtime();
        } else if(Date.now()-start > maxWait){
            clearInterval(timer);
            console.error('Supabase timeout after 10s');
            showToast('Ошибка подключения к БД (таймаут)','error');
            hideLoading();
            logoutAdmin();
        }
    },300);
}

function initAdmin() {
    if (typeof initSupabase === 'function' && !window.supabaseClient) {
        console.log('Initializing Supabase from admin-panel');
        initSupabase();
    }
    if(isAdminLoggedIn()){
        showAdminPanel();
        waitForSupabaseAndLoad();
    } else showLoginForm();
    document.getElementById('login-form')?.addEventListener('submit',loginAdmin);
    document.getElementById('logout-btn')?.addEventListener('click',(e)=>{e.preventDefault();logoutAdmin();});
}

async function loadAllData() {
    console.log('loadAllData: starting...');
    const client=getClient();
    if(!client){
        console.error('loadAllData: no client');
        showToast('Ошибка: Supabase не инициализирован','error');
        hideLoading();
        return;
    }
    try {
        console.log('loadAllData: loading tables and bookings...');
        await Promise.all([loadTables(),loadBookings()]);
        console.log('loadAllData: data loaded, rendering...');
        renderTablesList();
        renderBookingsTable();
        console.log('loadAllData: done');
    } catch (e) {
        console.error('loadAllData error:', e);
    } finally {
        hideLoading();
    }
}

async function loadTables() {
    const c=getClient(); if(!c) return;
    try{
        console.log('Loading tables...');
        const {data,error}=await c.from('tables').select('*').order('id');
        if(error) throw error;
        allTables=(data||[]).filter(t=>t&&t.id!=null).map(t=>({...t,id:+t.id,seats:+t.seats,x:+t.x,y:+t.y,is_active:!!t.is_active}));
        console.log('Tables loaded:', allTables.length);
        populateTableSelect();
    }catch(e){ console.error('Load tables error:',e); allTables=[]; }
}

async function loadBookings() {
    const c=getClient(); if(!c) return;
    try{
        console.log('Loading bookings...');
        const {data,error}=await c.from('bookings').select('*, tables(number,seats,zone_name)').order('date',{asc:false}).order('created_at',{asc:false});
        if(error) throw error;
        allBookings=data||[];
        console.log('Bookings loaded:', allBookings.length);
        renderBookingsTable();
    }catch(e){ console.error('Load bookings error:',e); allBookings=[]; renderBookingsTable(); }
}

function renderBookingsTable() {
    const tbody=document.getElementById('bookings-tbody');
    if(!tbody) return;
    if(!allBookings.length){ tbody.innerHTML='<tr><td colspan="9" class="no-data">Нет бронирований</td></tr>'; return; }
    tbody.innerHTML=allBookings.map(b=>{
        const id=+b.id||b.id, sid=`b-${id}`.replace(/[^a-zA-Z0-9_-]/g,'_');
        const editing=editingBookingId===id;
        return `<tr class="${editing?'editing-row':''}">
            <td>${id}</td>
            <td>${b.tables?.number||b.table_id||'—'}</td>
            <td>${b.customer_name||'—'}</td>
            <td>${b.customer_phone||'—'}</td>
            <td>${b.date||'—'}</td>
            <td>${b.time_slot||'—'}</td>
            <td>${b.guests_count||'—'}</td>
            <td><select class="status-select" onchange="updateStatus(${typeof id==='number'?id:`'${id}'`},this.value)" ${editing?'disabled':''}>
                <option value="new" ${b.status==='new'?'selected':''}>Новая</option>
                <option value="confirmed" ${b.status==='confirmed'?'selected':''}>Подтверждена</option>
                <option value="completed" ${b.status==='completed'?'selected':''}>Завершена</option>
                <option value="cancelled" ${b.status==='cancelled'?'selected':''}>Отменена</option>
            </select></td>
            <td class="action-buttons">${editing?
                `<button onclick="saveEdit('${sid}')" class="btn-action btn-save">Сохранить</button>
                 <button onclick="cancelEdit()" class="btn-action btn-cancel">Отмена</button>`:
                `<button onclick="startEdit('${sid}')" class="btn-action btn-edit">Ред.</button>
                 <button onclick="deleteBooking('${sid}')" class="btn-action btn-delete">Удал.</button>`
            }</td>
        </tr>`;
    }).join('');
}

function startEdit(id){ if(id) editingBookingId=id, renderBookingsTable(); }
function cancelEdit(){ editingBookingId=null; renderBookingsTable(); }

async function saveEdit(id){
    if(!id) return editingBookingId=null, renderBookingsTable();
    const c=getClient(); if(!c) return;
    const n=document.getElementById('edit-name')?.value, p=document.getElementById('edit-phone')?.value;
    if(!n||!p) return;
    try{ const {error}=await c.from('bookings').update({customer_name:n,customer_phone:p}).eq('id',id); if(error) throw error; editingBookingId=null; await loadBookings(); showToast('Сохранено','success'); }
    catch(err){ console.error(err); showToast('Ошибка: '+(err.message||err),'error'); }
}

async function updateStatus(id,s){
    if(!id) return;
    const c=getClient(); if(!c) return;
    try{ const {error}=await c.from('bookings').update({status:s||'new'}).eq('id',id); if(error) throw error; await loadBookings(); showToast('Статус обновлен','success'); }
    catch(err){ showToast('Ошибка: '+(err.message||err),'error'); }
}

async function deleteBooking(id){
    if(!id||!confirm('Удалить бронь?')) return;
    const c=getClient(); if(!c) return;
    try{ const {error}=await c.from('bookings').delete().eq('id',id); if(error) throw error; showToast('Удалено','success'); await loadBookings(); }
    catch(err){ showToast('Ошибка: '+(err.message||err),'error'); }
}

function populateTableSelect(){
    const s=document.getElementById('manual-table'); if(!s) return;
    s.innerHTML='<option value="">Выберите столик</option>'+allTables.map(t=>{
        const n=t.number||'?', seats=+t.seats||0, blocked=t.is_active===false?' - ЗАБЛОКИРОВАН':'';
        return `<option value="${+t.id}">Стол ${n} (${seats} мест${blocked})</option>`;
    }).join('');
}

async function addManualBooking(e){
    e.preventDefault();
    const c=getClient(); if(!c) return;
    const s=document.getElementById('manual-table'), tid=+s.value;
    if(!tid||isNaN(tid)) return showToast('Выберите столик','warning');
    const n=document.getElementById('manual-name').value.trim(),
          p=document.getElementById('manual-phone').value.trim(),
          d=document.getElementById('manual-date').value,
          t=document.getElementById('manual-time').value,
          g=+document.getElementById('manual-guests').value;
    if(!n||!p||!d||!t||!g) return showToast('Заполните все поля','warning');
    if(d<new Date().toISOString().split('T')[0]) return showToast('Нельзя на прошедшую дату','warning');
    try{
        const {error}=await c.from('bookings').insert({table_id:tid,customer_name:n,customer_phone:p,date:d,time_slot:t,guests_count:g,comment:document.getElementById('manual-comment').value.trim()||null,status:'confirmed'});
        if(error) throw error;
        showToast('Бронь добавлена!','success');
        document.getElementById('manual-booking-form').reset();
        document.getElementById('manual-date').value=new Date().toISOString().split('T')[0];
        await loadBookings();
    }catch(err){ showToast('Ошибка: '+(err.message||err),'error'); }
}

function renderTablesList(){
    const c=document.getElementById('tables-list'); if(!c) return;
    if(!allTables.length){ c.innerHTML='<p class="no-data">Загрузка...</p>'; return; }
    c.innerHTML=allTables.map(t=>{
        const id=+t.id, n=t.number||'?', seats=+t.seats||0, zone=t.zone_name||'', blocked=t.is_active===false?' blocked':'', btn=t.is_active===false?'Разблокировать':'Заблокировать';
        return `<div class="table-block${blocked}"><div class="table-info"><strong>Стол ${n}</strong><span class="table-details">${seats} мест • ${zone}</span></div><button onclick="toggleTable(${id},${!t.is_active})" class="btn-action ${t.is_active===false?'btn-unblock':'btn-block'}">${btn}</button></div>`;
    }).join('');
}

async function toggleTable(id, unblock){
    if(!id) return;
    const c=getClient(); if(!c) return;
    try{ const {error}=await c.from('tables').update({is_active:unblock}).eq('id',id); if(error) throw error; await loadTables(); showToast(unblock?'Разблокирован':'Заблокирован','success'); }
    catch(err){ showToast('Ошибка: '+(err.message||err),'error'); }
}

function setupRealtime(){
    const c=getClient(); if(!c) return;
    try{ c.channel('admin-changes')?.unsubscribe(); }catch(e){}
    c.channel('admin-changes').on('postgres_changes',{event:'*',schema:'public',table:'bookings'},()=>loadBookings())
     .on('postgres_changes',{event:'*',schema:'public',table:'tables'},()=>loadTables())
     .subscribe(s=>console.log('Realtime status:',s));
}

document.addEventListener('DOMContentLoaded', initAdmin);

window.deleteBooking=deleteBooking; window.startEdit=startEdit; window.cancelEdit=cancelEdit; window.toggleTable=toggleTable;