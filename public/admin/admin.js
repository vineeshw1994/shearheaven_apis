const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const resources = {
  clients: {
    title: 'Client Master',
    path: '/api/admin/clients',
    columns: ['id', 'clientId', 'name', 'isActive'],
    fields: [
      { name: 'clientId', label: 'ClientID', required: true },
      { name: 'name', label: 'Name', required: true },
      { name: 'isActive', label: 'Active', type: 'checkbox' },
    ],
  },
  regions: {
    title: 'Region Master',
    path: '/api/admin/regions',
    columns: ['id', 'regionId', 'name', 'clientId', 'isActive'],
    fields: [
      { name: 'regionId', label: 'RegionId', required: true },
      { name: 'name', label: 'Name', required: true },
      { name: 'clientId', label: 'ClientID', required: true },
      { name: 'isActive', label: 'Active', type: 'checkbox' },
    ],
  },
  stores: {
    title: 'Store Master',
    path: '/api/admin/stores',
    columns: ['id', 'storeId', 'name', 'clientId', 'regionId', 'isActive', 'cancellationThresholdHours'],
    fields: [
      { name: 'storeId', label: 'StoreId', required: true },
      { name: 'name', label: 'Name', required: true },
      { name: 'clientId', label: 'ClientID', required: true },
      { name: 'regionId', label: 'RegionId', required: true },
      { name: 'isActive', label: 'Active', type: 'checkbox' },
      { name: 'cancellationThresholdHours', label: 'Cancel Threshold (hours)', type: 'number' },
    ],
  },
  groomers: {
    title: 'Groomers',
    path: '/api/admin/groomers',
    columns: ['id', 'groomerCode', 'firstName', 'lastName', 'email', 'multiBookingEnabled', 'slotBookingLimit', 'role', 'type', 'isActive'],
    fields: [
      { name: 'groomerCode', label: 'Groomer Code', required: true },
      { name: 'firstName', label: 'First Name', required: true },
      { name: 'lastName', label: 'Last Name', required: true },
      { name: 'email', label: 'Email' },
      { name: 'password', label: 'Password', type: 'password' },
      { name: 'mobile', label: 'Mobile' },
      { name: 'multiBookingEnabled', label: 'Multi Booking Enabled', type: 'checkbox' },
      { name: 'slotBookingLimit', label: 'Slot Booking Limit', type: 'number' },
      { name: 'role', label: 'Role' },
      { name: 'highlights', label: 'Highlights' },
      { name: 'type', label: 'Type', type: 'select', options: ['Groomer', 'Bather'] },
      { name: 'isActive', label: 'Active', type: 'checkbox' },
      { name: 'clientId', label: 'ClientID' },
      { name: 'regionId', label: 'RegionId' },
      { name: 'storeId', label: 'StoreId' },
    ],
  },
  groomerBookings: {
    title: 'Groomer Bookings',
    custom: true,
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
    columns: ['id', 'groomerCode', 'dayOfWeek', 'isWorking', 'startTime', 'endTime', 'clientId', 'regionId', 'storeId'],
    fields: [
      { name: 'groomerCode', label: 'Groomer', type: 'groomer', required: true },
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
    columns: ['id', 'groomerCode', 'startDate', 'endDate', 'startTime', 'endTime', 'leaveType', 'reason', 'clientId', 'regionId', 'storeId'],
    fields: [
      { name: 'groomerCode', label: 'Groomer', type: 'groomer', required: true },
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

const tabOrder = ['clients', 'regions', 'stores', 'groomers', 'groomerBookings', 'holidays', 'storeHours', 'groomerHours', 'unavailability'];
let currentKey = 'clients';
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

function groomerLabel(code) {
  const match = groomers.find((item) => item.groomerCode === code);
  return match ? `${match.groomerCode} - ${match.firstName} ${match.lastName}` : code;
}

function formatCell(column, value) {
  if (column === 'groomerCode' && (currentKey === 'groomerHours' || currentKey === 'unavailability')) {
    return groomerLabel(value);
  }
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

  if (resource.custom && currentKey === 'groomerBookings') {
    renderGroomerBookingsView();
    return;
  }

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
          ? groomers.map((item) => ({ value: item.groomerCode, label: `${item.groomerCode} - ${item.firstName} ${item.lastName}` }))
          : field.options.map((option) => ({ value: option, label: option }));
        return `<label>${field.label}<select name="${field.name}" ${field.required ? 'required' : ''}>
          ${options.map((option) => `<option value="${option.value}" ${String(option.value) === String(value) ? 'selected' : ''}>${option.label}</option>`).join('')}
        </select></label>`;
      }
      const inputType = field.type === 'date'
        ? 'date'
        : field.type === 'time'
          ? 'time'
          : field.type === 'number'
            ? 'number'
            : field.type === 'password'
              ? 'password'
              : 'text';
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
    if (field.name === 'groomerCode' && field.type === 'groomer') {
      data[field.name] = input.value;
      return;
    }
    if (field.type === 'time' && input.value) {
      data[field.name] = String(input.value).slice(0, 5);
      return;
    }
    if (field.type === 'number' && input.value !== '') {
      data[field.name] = Number(input.value);
      return;
    }
    if (field.type === 'password') {
      if (input.value) {
        data[field.name] = input.value;
      }
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

    if (resource.custom && currentKey === 'groomerBookings') {
      document.getElementById('addBtn').style.display = 'none';
      renderGroomerBookingsView();
      setStatus('');
      return;
    }

    document.getElementById('addBtn').style.display = '';
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

function bookingSection(title, items) {
  const rowsHtml = (items || [])
    .map(
      (item) => `<tr>
        <td>${item.bookingId}</td>
        <td>${item.status}</td>
        <td>${item.bookingDate}</td>
        <td>${item.startTime} - ${item.endTime}</td>
        <td>${item.pet?.petName || '-'}</td>
        <td>${item.user?.name || '-'}</td>
        <td>${item.serviceName || '-'}</td>
      </tr>`
    )
    .join('');
  return `<section class="booking-section">
    <h3>${title} (${(items || []).length})</h3>
    <table>
      <thead><tr><th>ID</th><th>Status</th><th>Date</th><th>Time</th><th>Pet</th><th>Customer</th><th>Service</th></tr></thead>
      <tbody>${rowsHtml || '<tr><td colspan="7">No bookings</td></tr>'}</tbody>
    </table>
  </section>`;
}

async function renderGroomerBookingsView() {
  headEl.innerHTML = '';
  bodyEl.innerHTML = '<tr><td>Loading groomer bookings...</td></tr>';

  const options = groomers
    .map((item) => `<option value="${item.id}">${item.groomerCode} - ${item.firstName} ${item.lastName}</option>`)
    .join('');

  bodyEl.innerHTML = `<tr><td colspan="20">
    <div class="groomer-bookings-panel">
      <label>Groomer
        <select id="groomerBookingSelect">${options}</select>
      </label>
      <button type="button" id="loadGroomerBookingsBtn">Load Bookings</button>
      <div id="groomerBookingsContent"></div>
    </div>
  </td></tr>`;

  const selectEl = document.getElementById('groomerBookingSelect');
  const loadBtn = document.getElementById('loadGroomerBookingsBtn');
  const contentEl = document.getElementById('groomerBookingsContent');

  async function loadSelectedGroomerBookings() {
    const groomerId = Number(selectEl.value);
    if (!groomerId) return;
    contentEl.innerHTML = 'Loading...';
    try {
      const data = await api(`/api/admin/groomer-bookings/${groomerId}`);
      contentEl.innerHTML = [
        bookingSection('Pending Requests', data.pending),
        bookingSection('Cancellation Requests', data.cancellationRequests),
        bookingSection('Upcoming', data.upcoming),
        bookingSection('Past', data.past),
        bookingSection('Cancelled', data.cancelled),
      ].join('');
      setStatus(`Loaded bookings for ${data.groomer.firstName} ${data.groomer.lastName}`);
    } catch (error) {
      contentEl.innerHTML = '';
      setStatus(error.message, true);
    }
  }

  loadBtn.addEventListener('click', loadSelectedGroomerBookings);
  if (selectEl.value) {
    await loadSelectedGroomerBookings();
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
