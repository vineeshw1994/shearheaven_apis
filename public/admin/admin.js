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
  customers: {
    title: 'Customers',
    custom: true,
  },
  groomers: {
    title: 'Groomers',
    path: '/api/admin/groomers',
    columns: [
      'id',
      'groomerCode',
      'firstName',
      'lastName',
      'email',
      'clientId',
      'regionId',
      'storeId',
      'shopAssigned',
      'multiBookingEnabled',
      'slotBookingLimit',
      'role',
      'type',
      'isActive',
    ],
    fields: [
      { name: 'groomerCode', label: 'Groomer Code', required: true },
      { name: 'firstName', label: 'First Name', required: true },
      { name: 'lastName', label: 'Last Name', required: true },
      { name: 'email', label: 'Notification Email' },
      { name: 'notificationEmail', label: 'Send Credentials To' },
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
  discounts: {
    title: 'Discounts',
    path: '/api/admin/discounts',
    columns: ['id', 'code', 'name', 'serviceIds', 'discountType', 'discountValue', 'isActive', 'clientId', 'regionId', 'storeId'],
    fields: [
      { name: 'code', label: 'Code', required: true },
      { name: 'name', label: 'Name', required: true },
      { name: 'description', label: 'Description' },
      { name: 'serviceIds', label: 'Services', type: 'services' },
      { name: 'discountType', label: 'Type', type: 'select', options: ['percentage', 'fixed'] },
      { name: 'discountValue', label: 'Value', type: 'number' },
      { name: 'minOrderAmount', label: 'Min Order', type: 'number' },
      { name: 'startDate', label: 'Start Date', type: 'date' },
      { name: 'endDate', label: 'End Date', type: 'date' },
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

const tabOrder = [
  'clients',
  'regions',
  'stores',
  'customers',
  'groomers',
  'groomerBookings',
  'discounts',
  'holidays',
  'storeHours',
  'groomerHours',
  'unavailability',
];
let currentKey = 'clients';
let rows = [];
let groomers = [];
let catalogServices = [];
let editingId = null;

const tabsEl = document.getElementById('tabs');
const headEl = document.getElementById('tableHead');
const bodyEl = document.getElementById('tableBody');
const titleEl = document.getElementById('tableTitle');
const statusEl = document.getElementById('status');
const modalEl = document.getElementById('modal');
const formEl = document.getElementById('editForm');
const modalTitleEl = document.getElementById('modalTitle');
const loadingOverlayEl = document.getElementById('loadingOverlay');
const toastContainerEl = document.getElementById('toastContainer');

let loadingCount = 0;

function showLoading() {
  loadingCount += 1;
  loadingOverlayEl.classList.remove('hidden');
}

function hideLoading() {
  loadingCount = Math.max(0, loadingCount - 1);
  if (loadingCount === 0) {
    loadingOverlayEl.classList.add('hidden');
  }
}

function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  toastContainerEl.appendChild(toast);
  requestAnimationFrame(() => toast.classList.add('show'));
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}

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
  showLoading();
  try {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...options,
    });
    const json = await res.json();
    if (!res.ok || json.success === false) {
      throw new Error((json.errors && json.errors.join(', ')) || json.message || 'Request failed');
    }
    return json.data;
  } finally {
    hideLoading();
  }
}

function groomerLabel(code) {
  const match = groomers.find((item) => item.groomerCode === code);
  return match ? `${match.groomerCode} - ${match.firstName} ${match.lastName}` : code;
}

function serviceLabel(serviceIds) {
  if (!serviceIds || !serviceIds.length) return 'All services';
  return serviceIds
    .map((id) => {
      const match = catalogServices.find((item) => Number(item.id) === Number(id));
      return match ? match.name : `#${id}`;
    })
    .join(', ');
}

function formatCell(column, value, row) {
  if (column === 'serviceIds') {
    return serviceLabel(Array.isArray(value) ? value : []);
  }
  if (column === 'shopAssigned' && row?.shop) {
    return row.shop.shopAssigned
      ? `<span class="shop-badge ok">Assigned</span>`
      : `<span class="shop-badge warn">Not assigned</span>`;
  }
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
  if (resource.custom && currentKey === 'customers') {
    renderCustomersView();
    return;
  }

  headEl.innerHTML = `<tr>${resource.columns.map((col) => `<th>${col}</th>`).join('')}<th></th></tr>`;
  bodyEl.innerHTML = rows
    .map((row) => {
      const cells = resource.columns.map((col) => `<td>${formatCell(col, row[col], row)}</td>`).join('');
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
  void openModalAsync(id);
}

async function openModalAsync(id) {
  const resource = resources[currentKey];
  if (currentKey === 'discounts' && !catalogServices.length) {
    await loadCatalogServices();
  }
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
      if (field.type === 'services') {
        const selected = Array.isArray(row?.serviceIds) ? row.serviceIds.map(Number) : [];
        const options = catalogServices
          .map(
            (service) =>
              `<option value="${service.id}" ${selected.includes(Number(service.id)) ? 'selected' : ''}>${service.id} - ${service.name}</option>`
          )
          .join('');
        return `<label class="field-full">
          ${field.label}
          <select name="serviceIds" class="service-select" multiple size="7">
            ${options || '<option disabled>No services loaded</option>'}
          </select>
          <span class="field-help">Select one or more services. Leave empty to apply discount to all services.</span>
        </label>`;
      }
      const fullWidth = field.name === 'description' || field.type === 'services';
      const inputType = field.type === 'date'
        ? 'date'
        : field.type === 'time'
          ? 'time'
          : field.type === 'number'
            ? 'number'
            : field.type === 'password'
              ? 'password'
              : 'text';
      return `<label class="${fullWidth ? 'field-full' : ''}">${field.label}<input type="${inputType}" name="${field.name}" value="${value || ''}" ${field.required ? 'required' : ''} /></label>`;
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
    if (field.type === 'services') {
      const select = formEl.elements.serviceIds;
      data.serviceIds = select
        ? Array.from(select.selectedOptions).map((el) => Number(el.value))
        : [];
      return;
    }
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

async function loadCatalogServices() {
  catalogServices = (await api('/api/admin/catalog/services')) || [];
}

async function loadTable() {
  try {
    setStatus('Loading...');
    await loadGroomers();
    if (currentKey === 'discounts') {
      await loadCatalogServices();
    }
    const resource = resources[currentKey];

    if (resource.custom && (currentKey === 'groomerBookings' || currentKey === 'customers')) {
      document.getElementById('addBtn').style.display = 'none';
      if (currentKey === 'groomerBookings') {
        renderGroomerBookingsView();
      } else {
        renderCustomersView();
      }
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
    showToast(error.message, 'error');
    setStatus(error.message, true);
  }
}

function isBookingEndPast(item) {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return (
    String(item.bookingDate) < date ||
    (String(item.bookingDate) === date && String(item.endTime) <= time)
  );
}

function bookingRowActions(item) {
  const actions = [];
  if (item.status === 'pending') {
    actions.push(`<button type="button" data-approve-booking="${item.bookingId}">Accept</button>`);
    actions.push(`<button type="button" class="danger" data-reject-booking="${item.bookingId}">Reject</button>`);
  }
  if (item.status === 'confirmed') {
    actions.push(`<button type="button" data-start-booking="${item.bookingId}">Start</button>`);
  }
  if (item.status === 'in_progress') {
    actions.push(`<button type="button" data-complete-booking="${item.bookingId}">Complete</button>`);
  }
  if (!actions.length) return '<td>-</td>';
  return `<td class="row-actions">${actions.join('')}</td>`;
}

function bookingSection(title, items) {
  const rowsHtml = (items || [])
    .map(
      (item) => `<tr>
        <td>${item.bookingId}</td>
        <td>${item.status}</td>
        <td>${item.bookingDate}</td>
        <td>${item.startTime} - ${item.endTime}</td>
        <td>${item.groomerName || '-'}</td>
        <td>${item.pet?.petName || '-'}</td>
        <td>${item.user?.name || '-'}</td>
        <td>${item.serviceName || '-'}</td>
        ${bookingRowActions(item)}
      </tr>`
    )
    .join('');
  return `<section class="booking-section">
    <h3>${title} (${(items || []).length})</h3>
    <table>
      <thead><tr><th>ID</th><th>Status</th><th>Date</th><th>Time</th><th>Groomer</th><th>Pet</th><th>Customer</th><th>Service</th><th>Actions</th></tr></thead>
      <tbody>${rowsHtml || '<tr><td colspan="9">No bookings</td></tr>'}</tbody>
    </table>
  </section>`;
}

function attachBookingActionHandlers(contentEl, reloadFn) {
  contentEl.querySelectorAll('[data-approve-booking]').forEach((button) => {
    button.addEventListener('click', async () => {
      const bookingId = button.getAttribute('data-approve-booking');
      try {
        await api(`/api/admin/groomer-bookings/${bookingId}/approve`, { method: 'POST' });
        showToast('Booking accepted successfully');
        await reloadFn();
      } catch (error) {
        showToast(error.message, 'error');
        setStatus(error.message, true);
      }
    });
  });
  contentEl.querySelectorAll('[data-reject-booking]').forEach((button) => {
    button.addEventListener('click', async () => {
      if (!window.confirm('Reject this booking request?')) return;
      const bookingId = button.getAttribute('data-reject-booking');
      try {
        await api(`/api/admin/groomer-bookings/${bookingId}/reject`, { method: 'POST' });
        showToast('Booking rejected successfully');
        await reloadFn();
      } catch (error) {
        showToast(error.message, 'error');
        setStatus(error.message, true);
      }
    });
  });
  contentEl.querySelectorAll('[data-start-booking]').forEach((button) => {
    button.addEventListener('click', async () => {
      const bookingId = button.getAttribute('data-start-booking');
      try {
        await api(`/api/admin/groomer-bookings/${bookingId}/start`, { method: 'POST' });
        showToast('Appointment started');
        await reloadFn();
      } catch (error) {
        showToast(error.message, 'error');
        setStatus(error.message, true);
      }
    });
  });
  contentEl.querySelectorAll('[data-complete-booking]').forEach((button) => {
    button.addEventListener('click', async () => {
      const bookingId = button.getAttribute('data-complete-booking');
      try {
        await api(`/api/admin/groomer-bookings/${bookingId}/complete`, { method: 'POST' });
        showToast('Booking marked as completed');
        await reloadFn();
      } catch (error) {
        showToast(error.message, 'error');
        setStatus(error.message, true);
      }
    });
  });
}

function shopInfoHtml(shop, title) {
  if (!shop) return '';
  const cls = shop.shopAssigned ? 'shop-panel ok' : 'shop-panel warn';
  return `<div class="${cls}">
    <h4>${title}</h4>
    <p><strong>ClientID:</strong> ${shop.clientId || '(empty)'}</p>
    <p><strong>RegionId:</strong> ${shop.regionId || '(empty)'}</p>
    <p><strong>StoreId:</strong> ${shop.storeId || '(empty)'}</p>
    <p><strong>Summary:</strong> ${shop.shopLabel}</p>
    ${
      shop.shopAssigned
        ? ''
        : '<p class="shop-hint">Empty tenant — customer will not appear in groomer shop list until these are set.</p>'
    }
  </div>`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

async function renderCustomersView() {
  headEl.innerHTML = '';
  bodyEl.innerHTML = '<tr><td>Loading customers...</td></tr>';

  const query = tenantQuery();
  let customers = [];
  try {
    customers = (await api(`/api/admin/customers${query ? `?${query}` : ''}`)) || [];
  } catch (error) {
    bodyEl.innerHTML = `<tr><td>${escapeHtml(error.message)}</td></tr>`;
    showToast(error.message, 'error');
    setStatus(error.message, true);
    return;
  }

  rows = customers;

  bodyEl.innerHTML = `<tr><td colspan="20">
    <div class="customers-panel">
      <p class="panel-note">Uses header tenant filters. Shows customers matching the shop <em>or</em> with empty ClientID/RegionId/StoreId (not assigned).</p>
      <label>Search customers
        <input type="search" id="customerSearchInput" placeholder="Name, email, or mobile" />
      </label>
      <div id="customersListWrap"></div>
      <div id="customerDetailWrap" class="customer-detail hidden"></div>
    </div>
  </td></tr>`;

  const searchInput = document.getElementById('customerSearchInput');
  const listWrap = document.getElementById('customersListWrap');
  const detailWrap = document.getElementById('customerDetailWrap');

  function renderCustomerList() {
    const term = (searchInput.value || '').trim().toLowerCase();
    const filtered = customers.filter((item) => {
      if (!term) return true;
      return [item.name, item.email, item.mobile, item.shop?.shopLabel]
        .filter(Boolean)
        .some((part) => String(part).toLowerCase().includes(term));
    });

    const tableRows = filtered
      .map(
        (item) => `<tr class="customer-row" data-customer-id="${item.id}">
          <td>${item.id}</td>
          <td>${escapeHtml(item.name)}</td>
          <td>${escapeHtml(item.email)}</td>
          <td>${escapeHtml(item.mobile || '-')}</td>
          <td>${item.emailVerified ? 'Yes' : 'No'}</td>
          <td>${escapeHtml(item.clientId || '-')}</td>
          <td>${escapeHtml(item.regionId || '-')}</td>
          <td>${escapeHtml(item.storeId || '-')}</td>
          <td>${
            item.shop?.shopAssigned
              ? '<span class="shop-badge ok">Assigned</span>'
              : '<span class="shop-badge warn">Not assigned</span>'
          }</td>
          <td><button type="button" data-view-customer="${item.id}">View</button></td>
        </tr>`
      )
      .join('');

    listWrap.innerHTML = `<table class="customers-table">
      <thead><tr>
        <th>ID</th><th>Name</th><th>Email</th><th>Mobile</th><th>Verified</th>
        <th>ClientID</th><th>RegionId</th><th>StoreId</th><th>Shop</th><th></th>
      </tr></thead>
      <tbody>${tableRows || '<tr><td colspan="10">No customers found</td></tr>'}</tbody>
    </table>`;

    listWrap.querySelectorAll('[data-view-customer]').forEach((button) => {
      button.addEventListener('click', () => loadCustomerDetail(Number(button.getAttribute('data-view-customer'))));
    });
    listWrap.querySelectorAll('.customer-row').forEach((row) => {
      row.addEventListener('click', (event) => {
        if (event.target.closest('button')) return;
        loadCustomerDetail(Number(row.getAttribute('data-customer-id')));
      });
    });

    setStatus(`${filtered.length} customer(s)`);
  }

  async function loadCustomerDetail(userId) {
    detailWrap.classList.remove('hidden');
    detailWrap.innerHTML = '<p>Loading customer detail...</p>';
    try {
      const data = await api(`/api/admin/customers/${userId}`);
      const customer = data.customer;
      const pets = data.pets || [];
      const bookings = data.bookings || [];

      const petsRows = pets
        .map(
          (pet) => `<tr>
            <td>${pet.id}</td>
            <td>${escapeHtml(pet.petName)}</td>
            <td>${escapeHtml(pet.breed || '-')}</td>
            <td>${escapeHtml(pet.weight || '-')}</td>
            <td>${escapeHtml(pet.gender || '-')}</td>
            <td>${escapeHtml(pet.clientId || '-')}</td>
            <td>${escapeHtml(pet.regionId || '-')}</td>
            <td>${escapeHtml(pet.storeId || '-')}</td>
          </tr>`
        )
        .join('');

      const bookingRows = bookings
        .map(
          (item) => `<tr>
            <td>${item.bookingId}</td>
            <td>${escapeHtml(item.status)}</td>
            <td>${escapeHtml(item.bookingDate)}</td>
            <td>${escapeHtml(item.startTime)} - ${escapeHtml(item.endTime)}</td>
            <td>${escapeHtml(item.groomerName || '-')}</td>
            <td>${escapeHtml(item.pet?.petName || '-')}</td>
            <td>${escapeHtml(item.serviceName || '-')}</td>
            <td>${escapeHtml(item.clientId || '-')}</td>
            <td>${escapeHtml(item.regionId || '-')}</td>
            <td>${escapeHtml(item.storeId || '-')}</td>
          </tr>`
        )
        .join('');

      detailWrap.innerHTML = `
        <div class="customer-detail-header">
          <h3>${escapeHtml(customer.name)} <span class="muted">#${customer.id}</span></h3>
          <button type="button" class="secondary" id="closeCustomerDetailBtn">Close</button>
        </div>
        <div class="detail-grid">
          <div class="detail-card">
            <h4>Contact</h4>
            <p><strong>Email:</strong> ${escapeHtml(customer.email)}</p>
            <p><strong>Mobile:</strong> ${escapeHtml(customer.mobile || '-')}</p>
            <p><strong>Email verified:</strong> ${customer.emailVerified ? 'Yes' : 'No'}</p>
            <p><strong>Registered:</strong> ${customer.createdAt ? escapeHtml(String(customer.createdAt).slice(0, 10)) : '-'}</p>
          </div>
          ${shopInfoHtml(customer.shop, 'Customer shop (tenant)')}
        </div>
        <section class="booking-section">
          <h3>Pets (${pets.length})</h3>
          <table>
            <thead><tr>
              <th>ID</th><th>Name</th><th>Breed</th><th>Weight</th><th>Gender</th>
              <th>ClientID</th><th>RegionId</th><th>StoreId</th>
            </tr></thead>
            <tbody>${petsRows || '<tr><td colspan="8">No pets</td></tr>'}</tbody>
          </table>
        </section>
        <section class="booking-section">
          <h3>Bookings (${bookings.length})</h3>
          <table>
            <thead><tr>
              <th>ID</th><th>Status</th><th>Date</th><th>Time</th><th>Groomer</th><th>Pet</th><th>Service</th>
              <th>ClientID</th><th>RegionId</th><th>StoreId</th>
            </tr></thead>
            <tbody>${bookingRows || '<tr><td colspan="10">No bookings</td></tr>'}</tbody>
          </table>
        </section>`;

      document.getElementById('closeCustomerDetailBtn').addEventListener('click', () => {
        detailWrap.classList.add('hidden');
        detailWrap.innerHTML = '';
      });

      listWrap.querySelectorAll('.customer-row').forEach((row) => {
        row.classList.toggle('selected', Number(row.getAttribute('data-customer-id')) === userId);
      });
    } catch (error) {
      detailWrap.innerHTML = `<p class="empty-bookings">${escapeHtml(error.message)}</p>`;
      showToast(error.message, 'error');
    }
  }

  searchInput.addEventListener('input', renderCustomerList);
  renderCustomerList();
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
    contentEl.innerHTML = '<p class="empty-bookings">Loading bookings...</p>';
    try {
      const data = await api(`/api/admin/groomer-bookings/${groomerId}`);
      const sections = [
        data.pending,
        data.cancellationRequests,
        data.upcoming,
        data.past,
        data.cancelled,
      ];
      const total = sections.reduce((sum, items) => sum + (items?.length || 0), 0);
      const groomerName = `${data.groomer.firstName} ${data.groomer.lastName}`.trim();

      if (total === 0) {
        contentEl.innerHTML = `<p class="empty-bookings">No bookings found for ${groomerName}.</p>`;
        setStatus(`No bookings for ${groomerName}`);
        return;
      }

      contentEl.innerHTML = [
        bookingSection('Pending Requests', data.pending),
        bookingSection('Cancellation Requests', data.cancellationRequests),
        bookingSection('Upcoming', data.upcoming),
        bookingSection('Past', data.past),
        bookingSection('Cancelled', data.cancelled),
      ].join('');
      attachBookingActionHandlers(contentEl, loadSelectedGroomerBookings);
      setStatus(`Loaded bookings for ${groomerName}`);
    } catch (error) {
      contentEl.innerHTML = `<p class="empty-bookings">${error.message}</p>`;
      showToast(error.message, 'error');
      setStatus(error.message, true);
    }
  }

  loadBtn.addEventListener('click', loadSelectedGroomerBookings);
  selectEl.addEventListener('change', loadSelectedGroomerBookings);
  if (selectEl.value) {
    await loadSelectedGroomerBookings();
  }
}

async function deleteRow(id) {
  if (!window.confirm('Delete this row?')) return;
  try {
    await api(`${resources[currentKey].path}/${id}`, { method: 'DELETE' });
    showToast('Row deleted successfully');
    await loadTable();
  } catch (error) {
    showToast(error.message, 'error');
    setStatus(error.message, true);
  }
}

formEl.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    const body = JSON.stringify(readForm());
    if (editingId) {
      await api(`${resources[currentKey].path}/${editingId}`, { method: 'PUT', body });
      showToast('Row updated successfully');
    } else {
      await api(resources[currentKey].path, { method: 'POST', body });
      showToast('Row added successfully');
    }
    closeModal();
    await loadTable();
  } catch (error) {
    showToast(error.message, 'error');
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
