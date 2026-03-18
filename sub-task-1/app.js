/* ── State ── */
let allTasks = [];
let filteredTasks = [];
let sortField = null;
let sortDir = 'asc';
let activeEditId = null;
let filterActive = false;

/* ── Random date between 1/1/2024 and 7/1/2024 ── */
function randomDate() {
  const start = new Date('2024-01-01').getTime();
  const end   = new Date('2024-07-01').getTime();
  return new Date(start + Math.random() * (end - start));
}

function formatDate(d) {
  return d.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

function isoDate(d) {
  return d.toISOString().slice(0, 10);
}

/* ── Fetch todos ── */
async function loadTasks() {
  try {
    const res  = await fetch('https://jsonplaceholder.typicode.com/todos?_limit=20');
    const data = await res.json();
    allTasks = data.map(item => ({
      id:    item.id,
      title: item.title,
      date:  randomDate(),
      done:  false,
    }));
    filteredTasks = [...allTasks];
    renderTable();
  } catch (e) {
    document.getElementById('todoBody').innerHTML =
      `<tr><td colspan="3" class="empty-state"><span>⚠️</span>Failed to load tasks. Check connection.</td></tr>`;
  }
}

/* ── Render Table ── */
function renderTable() {
  const tbody = document.getElementById('todoBody');
  let tasks = [...filteredTasks];

  if (sortField) {
    tasks.sort((a, b) => {
      let va = sortField === 'title' ? a.title.toLowerCase() : a.date.getTime();
      let vb = sortField === 'title' ? b.title.toLowerCase() : b.date.getTime();
      return sortDir === 'asc' ? (va > vb ? 1 : -1) : (va < vb ? 1 : -1);
    });
  }

  if (!tasks.length) {
    tbody.innerHTML = `<tr><td colspan="3" class="empty-state"><span>🔍</span>No tasks match the selected date range.</td></tr>`;
    return;
  }

  tbody.innerHTML = tasks.map(t => `
    <tr id="row-${t.id}" class="${t.done ? 'done' : ''}">
      <td class="task-name">
        <div class="check-wrap">
          <div class="custom-check ${t.done ? 'checked' : ''}" onclick="toggleDone(${t.id})"></div>
          <span>${escHtml(t.title)}</span>
          <button class="icon-btn edit" onclick="openEdit(${t.id})" aria-label="Edit task">✎</button>
        </div>
      </td>
      <td class="task-date">${formatDate(t.date)}</td>
      <td class="task-delete">
        <button class="icon-btn del" onclick="deleteRow(${t.id})" aria-label="Delete task">🗑</button>
      </td>
    </tr>
  `).join('');
}

/* ── Escape HTML ── */
function escHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ── Sort ── */
function sortBy(field) {
  if (sortField === field) {
    sortDir = sortDir === 'asc' ? 'desc' : 'asc';
  } else {
    sortField = field;
    sortDir   = 'asc';
  }
  ['title', 'date'].forEach(f => {
    const th = document.getElementById('th-' + f);
    th.classList.remove('sort-asc', 'sort-desc');
  });
  const active = document.getElementById('th-' + field);
  active.classList.add(sortDir === 'asc' ? 'sort-asc' : 'sort-desc');
  renderTable();
}

/* ── Toggle Done ── */
function toggleDone(id) {
  const task = allTasks.find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  const ft = filteredTasks.find(t => t.id === id);
  if (ft) ft.done = task.done;
  renderTable();
}

/* ── Filter ── */
function applyFilter() {
  const from = document.getElementById('dateFrom').value;
  const to   = document.getElementById('dateTo').value;
  if (!from && !to) { resetFilter(); return; }

  const fromD = from ? new Date(from + 'T00:00:00') : null;
  const toD   = to   ? new Date(to   + 'T23:59:59') : null;

  filteredTasks = allTasks.filter(t => {
    if (fromD && t.date < fromD) return false;
    if (toD   && t.date > toD)   return false;
    return true;
  });
  filterActive = true;
  renderTable();
}

function resetFilter() {
  document.getElementById('dateFrom').value = '';
  document.getElementById('dateTo').value   = '';
  filteredTasks = [...allTasks];
  filterActive  = false;
  renderTable();
}

/* ── Delete ── */
function deleteRow(id) {
  const row = document.getElementById('row-' + id);
  if (row) {
    row.classList.add('row-deleting');
    setTimeout(() => {
      allTasks      = allTasks.filter(t => t.id !== id);
      filteredTasks = filteredTasks.filter(t => t.id !== id);
      renderTable();
    }, 280);
  }
}

/* ── Sidebar / Edit ── */
function openEdit(id) {
  const task = allTasks.find(t => t.id === id);
  if (!task) return;
  activeEditId = id;
  document.getElementById('editText').value = task.title;
  document.getElementById('sidebar').classList.add('open');
  document.getElementById('overlay').classList.add('open');
  document.getElementById('editText').focus();
}

function closeSidebar() {
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('overlay').classList.remove('open');
  activeEditId = null;
}

function saveEdit() {
  if (activeEditId === null) return;
  const newTitle = document.getElementById('editText').value.trim();
  if (!newTitle) return;

  const task = allTasks.find(t => t.id === activeEditId);
  if (task) task.title = newTitle;
  const ft = filteredTasks.find(t => t.id === activeEditId);
  if (ft)  ft.title = newTitle;

  closeSidebar();
  renderTable();
}

/* ── Init ── */
loadTasks();