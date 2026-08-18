const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const resources = {
  groomers: {
    title: 'Groomers',
    path: '/api/admin/groomers',
    columns: ['id', 'groomerCode', 'firstName', 'lastName', 'role', 'type', 'isActive', 'clientId', 'regionId', 'storeId'],
    fields: [
      { name: 'groomerCode', label: 'Groomer Code', required: true },
      { name: 'firstName', label: 'First Name', required: true },
      { name: 'lastName', label: 'Last Name', required: true },
      { name: 'role', label: 'Role' },
      { name: 'highlights', label: 'Highlights' },
      { name: 'type', label: 'Type', type: 'select', options: ['Groomer', 'Bather'] },
      { name: 'isActive', label: 'Active', type: 'checkbox' },
      { name: 'clientId', label: 'ClientID' },
      { name: 'regionId', label: 'RegionId' },
      { name: 'storeId', label: 'StoreId' },
    ],
  },
  holidays: {
    title: 'Holiday List',
    path: '/api/admin/holidays',
    columns: ['id', 'holidayCode', 'name', 'date', 'isStoreSpecific', 'description', 'clientId', 'regionId', 'storeId'],
    fields: [
      { name: 'holidayCode', label: 'Holiday Code', required: true },
      { name: 'name', label: 'Name', required: true },
      { name: 'date', label: 'Date', type: 'date', required: true },
      { name: 'description', label: 'Description' },
      { name: 'isStoreSpecific', label: 'Store Specific', type: 'checkbox' },
      { name: 'clientId', label: 'ClientID' },
      { name: 'regionId', label: 'RegionId' },
      { name: 'storeId', label: 'StoreId' },
    ],
  },
  storeHours: {
    title: 'Store Operational Hours',
    path: '/api/admin/store-hours',
    columns: ['id', 'dayOfWeek', 'isOpen', 'startTime', 'endTime', 'clientId', 'regionId', 'storeId'],
    fields: [
      { name: 'dayOfWeek', label: 'Day', type: 'select', options: DAYS, required: true },
      { name: 'isOpen', label: 'Open', type: 'checkbox' },
      { name: 'startTime', label: 'Start Time', type: 'time' },
      { name: 'endTime', label: 'End Time', type: 'time' },
      { name: 'clientId', label: 'ClientID' },
      { name: 'regionId', label: 'RegionId' },
      { name: 'storeId', label: 'StoreId' },
    ],
  },
  groomerHours: {
    title: 'Groomer Working Hours',
    path: '/api/admin/groomer-hours',
    columns: ['id', 'groomerId', 'dayOfWeek', 'isWorking', 'startTime', 'endTime', 'clientId', 'regionId', 'storeId'],
    fields: [
      { name: 'groomerId', label: 'Groomer', type: 'groomer', required: true },
      { name: 'dayOfWeek', label: 'Day', type: 'select', options: DAYS, required: true },
      { name: 'isWorking', label: 'Working', type: 'checkbox' },
      { name: 'startTime', label: 'Start Time', type: 'time' },
      { name: 'endTime', label: 'End Time', type: 'time' },
      { name: 'clientId', label: 'ClientID' },
      { name: 'regionId', label: 'RegionId' },
      { name: 'storeId', label: 'StoreId' },
    ],
  },
  unavailability: {
    title: 'Groomer Unavailability',
    path: '/api/admin/groomer-unavailability',
    columns: ['id', 'groomerId', 'startDate', 'endDate', 'startTime', 'endTime', 'leaveType', 'reason', 'clientId', 'regionId', 'storeId'],
    fields: [
      { name: 'groomerId', label: 'Groomer', type: 'groomer', required: true },
      { name: 'startDate', label: 'Start Date', type: 'date', required: true },
      { name: 'endDate', label: 'End Date', type: 'date', required: true },
      { name: 'startTime', label: 'Start Time', type: 'time' },
      { name: 'endTime', label: 'End Time', type: 'time' },
      { name: 'leaveType', label: 'Leave Type', type: 'select', options: ['leave', 'break', 'unavailable', 'other'] },
      { name: 'reason', label: 'Reason' },
      { name: 'clientId', label: 'ClientID' },
      { name: 'regionId', label: 'RegionId' },
      { name: 'storeId', label: 'StoreId' },
    ],
  },
};

const tabOrder = ['groomers', 'holidays', 'storeHours', 'groomerHours', 'unavailability'];
let currentKey = 'groomers';
let rows = [];
let groomers = [];
let editingId = null;

const tabsEl = document.getElementById('tabs');
const headEl = document.getElementById('tableHead');
const bodyEl = document.getElementById('tableBody');
const titleEl = document.getElementById('tableTitle');
const statusEl = document.getElementById('status');
const modalEl = document.getElementById('modal');
const formEl = document.getElementById('editForm');
const modalTitleEl = document.getElementById('modalTitle');

function tenantQuery() {
  const params = new URLSearchParams();
  const clientId = document.getElementById('filterClientId').value.trim();
  const regionId = document.getElementById('filterRegionId').value.trim();
  const storeId = document.getElementById('filterStoreId').value.trim();
  if (clientId) params.set('ClientID', clientId);
  if (regionId) params.set('RegionId', regionId);
  if (storeId) params.set('StoreId', storeId);
  return params.toString();
}

function setStatus(message, isError) {
  statusEl.textContent = message || '';
  statusEl.style.color = isError ? '#b42318' : '#5d6b64';
}

async function api(path, options) {
  const res = await fetch(path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const json = await res.json();
  if (!res.ok || json.success === false) {
    throw new Error((json.errors && json.errors.join(', ')) || json.message || 'Request failed');
  }
  return json.data;
}

function groomerLabel(id) {
  const match = groomers.find((item) => Number(item.id) === Number(id));
  return match ? `${match.id} - ${match.firstName} ${match.lastName}` : id;
}

function formatCell(column, value) {
  if (column === 'groomerId') return groomerLabel(value);
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  return value === null || value === undefined || value === '' ? '-' : value;
}

function renderTabs() {
  tabsEl.innerHTML = '';
  tabOrder.forEach((key) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = resources[key].title;
    if (key === currentKey) button.className = 'active';
    button.addEventListener('click', () => {
      currentKey = key;
      renderTabs();
      loadTable();
    });
    tabsEl.appendChild(button);
  });
}

function renderTable() {
  const resource = resources[currentKey];
  titleEl.textContent = resource.title;
  headEl.innerHTML = `<tr>${resource.columns.map((col) => `<th>${col}</th>`).join('')}<th></th></tr>`;
  bodyEl.innerHTML = rows
    .map((row) => {
      const cells = resource.columns.map((col) => `<td>${formatCell(col, row[col])}</td>`).join('');
      return `<tr>${cells}<td class="row-actions">
        <button type="button" data-edit="${row.id}">Edit</button>
        <button type="button" class="danger" data-delete="${row.id}">Delete</button>
      </td></tr>`;
    })
    .join('');

  bodyEl.querySelectorAll('[data-edit]').forEach((button) => {
    button.addEventListener('click', () => openModal(Number(button.getAttribute('data-edit'))));
  });
  bodyEl.querySelectorAll('[data-delete]').forEach((button) => {
    button.addEventListener('click', () => deleteRow(Number(button.getAttribute('data-delete'))));
  });
}

function fieldValue(field, row) {
  if (!row) {
    if (field.name === 'clientId') return document.getElementById('filterClientId').value;
    if (field.name === 'regionId') return document.getElementById('filterRegionId').value;
    if (field.name === 'storeId') return document.getElementById('filterStoreId').value;
    if (field.type === 'checkbox') return true;
    return '';
  }
  return row[field.name];
}

function openModal(id) {
  const resource = resources[currentKey];
  const row = id ? rows.find((item) => Number(item.id) === id) : null;
  editingId = id || null;
  modalTitleEl.textContent = id ? `Edit ${resource.title}` : `Add ${resource.title}`;
  formEl.innerHTML = resource.fields
    .map((field) => {
      const value = fieldValue(field, row);
      if (field.type === 'checkbox') {
        return `<label>${field.label}<input type="checkbox" name="${field.name}" ${value ? 'checked' : ''} /></label>`;
      }
      if (field.type === 'select' || field.type === 'groomer') {
        const options = field.type === 'groomer'
          ? groomers.map((item) => ({ value: item.id, label: `${item.id} - ${item.firstName} ${item.lastName}` }))
          : field.options.map((option) => ({ value: option, label: option }));
        return `<label>${field.label}<select name="${field.name}" ${field.required ? 'required' : ''}>
          ${options.map((option) => `<option value="${option.value}" ${String(option.value) === String(value) ? 'selected' : ''}>${option.label}</option>`).join('')}
        </select></label>`;
      }
      const inputType = field.type === 'date' ? 'date' : field.type === 'time' ? 'time' : 'text';
      return `<label>${field.label}<input type="${inputType}" name="${field.name}" value="${value || ''}" ${field.required ? 'required' : ''} /></label>`;
    })
    .join('');
  modalEl.classList.remove('hidden');
}

function closeModal() {
  modalEl.classList.add('hidden');
  editingId = null;
}

function readForm() {
  const data = {};
  resources[currentKey].fields.forEach((field) => {
    const input = formEl.elements[field.name];
    if (!input) return;
    if (field.type === 'checkbox') {
      data[field.name] = input.checked;
      return;
    }
    if (field.name === 'groomerId') {
      data[field.name] = Number(input.value);
      return;
    }
    if (field.type === 'time' && input.value) {
      data[field.name] = String(input.value).slice(0, 5);
      return;
    }
    data[field.name] = input.value;
  });
  return data;
}

async function loadGroomers() {
  const query = tenantQuery();
  groomers = (await api(`/api/admin/groomers${query ? `?${query}` : ''}`)) || [];
}

async function loadTable() {
  try {
    setStatus('Loading...');
    await loadGroomers();
    const resource = resources[currentKey];
    const query = tenantQuery();
    rows = (await api(`${resource.path}${query ? `?${query}` : ''}`)) || [];
    renderTable();
    setStatus(`${rows.length} row(s)`);
  } catch (error) {
    rows = [];
    renderTable();
    setStatus(error.message, true);
  }
}

async function deleteRow(id) {
  if (!window.confirm('Delete this row?')) return;
  try {
    await api(`${resources[currentKey].path}/${id}`, { method: 'DELETE' });
    await loadTable();
  } catch (error) {
    setStatus(error.message, true);
  }
}

formEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const body = JSON.stringify(readForm());
    if (editingId) {
      await api(`${resources[currentKey].path}/${editingId}`, { method: 'PUT', body });
    } else {
      await api(resources[currentKey].path, { method: 'POST', body });
    }
    closeModal();
    await loadTable();
  } catch (error) {
    setStatus(error.message, true);
  }
});

document.getElementById('addBtn').addEventListener('click', () => openModal(null));
document.getElementById('cancelBtn').addEventListener('click', closeModal);
document.getElementById('reloadBtn').addEventListener('click', loadTable);
modalEl.addEventListener('click', (event) => {
  if (event.target === modalEl) closeModal();
});

renderTabs();
loadTable();
