import { Model, ModelStatic, WhereOptions } from 'sequelize';
import {
  ClientMaster,
  RegionMaster,
  StoreMaster,
  Groomer,
  Holiday,
  StoreOperationalHour,
  GroomerWorkingHour,
  GroomerUnavailability,
} from '../models';
import { NotFoundError, ValidationError } from '../utils/response';
import { DAYS_OF_WEEK, resolveTenant, TenantInput } from '../utils/schedule';

function tenantFilter(query: TenantInput) {
  const tenant: Record<string, string> = {};
  if (query.ClientID || query.clientId) tenant.clientId = (query.ClientID || query.clientId) as string;
  if (query.RegionId || query.regionId) tenant.regionId = (query.RegionId || query.regionId) as string;
  if (query.StoreId || query.storeId) tenant.storeId = (query.StoreId || query.storeId) as string;
  return tenant;
}

async function listRows<T extends Model>(
  model: ModelStatic<T>,
  where: WhereOptions,
  order: Array<[string, string]>
) {
  return model.findAll({ where, order });
}

async function getRow<T extends Model>(model: ModelStatic<T>, id: number) {
  const row = await model.findByPk(id);
  if (!row) {
    throw new NotFoundError('Record not found');
  }
  return row;
}

function withTenant<T extends TenantInput>(body: T) {
  return { ...body, ...resolveTenant(body) };
}

function assertDay(dayOfWeek?: string) {
  if (dayOfWeek && !DAYS_OF_WEEK.includes(dayOfWeek as (typeof DAYS_OF_WEEK)[number])) {
    throw new ValidationError(`dayOfWeek must be one of: ${DAYS_OF_WEEK.join(', ')}`);
  }
}

async function assertGroomerCode(groomerCode: string, tenant: TenantInput = {}) {
  const where: Record<string, unknown> = { groomerCode, ...tenantFilter(tenant) };
  const row = await Groomer.findOne({ where });
  if (!row) {
    throw new NotFoundError(`Groomer code ${groomerCode} not found`);
  }
  return row;
}

export async function listClients() {
  return listRows(ClientMaster, {}, [['id', 'ASC']]);
}

export async function createClient(body: Record<string, unknown>) {
  return ClientMaster.create(body as never);
}

export async function updateClient(id: number, body: Record<string, unknown>) {
  const row = await getRow(ClientMaster, id);
  await row.update(body);
  return row;
}

export async function deleteClient(id: number) {
  const row = await getRow(ClientMaster, id);
  await row.destroy();
}

export async function listRegions(query: TenantInput) {
  const where: WhereOptions = {};
  if (query.ClientID || query.clientId) {
    (where as Record<string, unknown>).clientId = (query.ClientID || query.clientId) as string;
  }
  return listRows(RegionMaster, where, [['id', 'ASC']]);
}

export async function createRegion(body: TenantInput & Record<string, unknown>) {
  const payload = {
    ...body,
    clientId: body.clientId || body.ClientID || resolveTenant(body).clientId,
  };
  return RegionMaster.create(payload as never);
}

export async function updateRegion(id: number, body: Record<string, unknown>) {
  const row = await getRow(RegionMaster, id);
  await row.update(body);
  return row;
}

export async function deleteRegion(id: number) {
  const row = await getRow(RegionMaster, id);
  await row.destroy();
}

export async function listStores(query: TenantInput) {
  const where: WhereOptions = {};
  if (query.ClientID || query.clientId) {
    (where as Record<string, unknown>).clientId = (query.ClientID || query.clientId) as string;
  }
  if (query.RegionId || query.regionId) {
    (where as Record<string, unknown>).regionId = (query.RegionId || query.regionId) as string;
  }
  return listRows(StoreMaster, where, [['id', 'ASC']]);
}

export async function createStore(body: TenantInput & Record<string, unknown>) {
  return StoreMaster.create(withTenant(body) as never);
}

export async function updateStore(id: number, body: Record<string, unknown>) {
  const row = await getRow(StoreMaster, id);
  await row.update(body);
  return row;
}

export async function deleteStore(id: number) {
  const row = await getRow(StoreMaster, id);
  await row.destroy();
}

export async function listGroomers(query: TenantInput) {
  const rows = await listRows(Groomer, tenantFilter(query), [['id', 'ASC']]);
  return rows.map((row) => {
    const data = row.toJSON() as Record<string, unknown>;
    delete data.password;
    return data;
  });
}

export async function createGroomer(body: TenantInput & Record<string, unknown>) {
  const payload = withTenant(body) as Record<string, unknown>;
  const { hashPassword } = await import('../utils/crypto');
  const groomerCode = String(payload.groomerCode || 'groomer').toLowerCase().replace(/[^a-z0-9]/g, '');
  const tempLoginId = `${groomerCode}${Date.now()}@temp.shearheaven.com`;
  const tempPassword = `Tmp@${Math.random().toString(36).slice(2, 8)}9`;
  payload.tempLoginId = tempLoginId;
  payload.password = await hashPassword(tempPassword);
  payload.mustChangePassword = true;
  if (payload.email) {
    payload.email = String(payload.email).trim().toLowerCase();
  } else {
    payload.email = '';
  }
  const row = await Groomer.create(payload as never);
  const notifyEmail = String(body.notificationEmail || body.email || '').trim();
  if (notifyEmail) {
    const { sendGroomerWelcomeEmail } = await import('./email.service');
    await sendGroomerWelcomeEmail(notifyEmail, String(row.firstName), tempLoginId, tempPassword);
  }
  const sanitized = sanitizeGroomerRow(row) as Record<string, unknown>;
  sanitized.tempCredentialsSent = Boolean(notifyEmail);
  return sanitized;
}

export async function updateGroomer(id: number, body: Record<string, unknown>) {
  const row = await getRow(Groomer, id);
  const payload = { ...body };
  if (payload.password) {
    const { hashPassword } = await import('../utils/crypto');
    payload.password = await hashPassword(String(payload.password));
  } else {
    delete payload.password;
  }
  if (payload.email) {
    payload.email = String(payload.email).trim().toLowerCase();
  }
  await row.update(payload);
  return sanitizeGroomerRow(row);
}

function sanitizeGroomerRow(row: Groomer) {
  const data = row.toJSON() as Record<string, unknown>;
  delete data.password;
  return data;
}

export async function deleteGroomer(id: number) {
  const row = await getRow(Groomer, id);
  await row.destroy();
}

export async function listHolidays(query: TenantInput) {
  return listRows(Holiday, tenantFilter(query), [['date', 'ASC']]);
}

export async function createHoliday(body: TenantInput & Record<string, unknown>) {
  return Holiday.create(withTenant(body) as never);
}

export async function updateHoliday(id: number, body: Record<string, unknown>) {
  const row = await getRow(Holiday, id);
  await row.update(body);
  return row;
}

export async function deleteHoliday(id: number) {
  const row = await getRow(Holiday, id);
  await row.destroy();
}

export async function listStoreHours(query: TenantInput) {
  return listRows(StoreOperationalHour, tenantFilter(query), [['id', 'ASC']]);
}

export async function createStoreHour(body: TenantInput & { dayOfWeek: string } & Record<string, unknown>) {
  assertDay(body.dayOfWeek);
  return StoreOperationalHour.create(withTenant(body) as never);
}

export async function updateStoreHour(id: number, body: Record<string, unknown>) {
  assertDay(body.dayOfWeek as string | undefined);
  const row = await getRow(StoreOperationalHour, id);
  await row.update(body);
  return row;
}

export async function deleteStoreHour(id: number) {
  const row = await getRow(StoreOperationalHour, id);
  await row.destroy();
}

export async function listGroomerHours(query: TenantInput & { groomerCode?: string }) {
  const where: WhereOptions = { ...tenantFilter(query) };
  if (query.groomerCode) {
    (where as Record<string, unknown>).groomerCode = query.groomerCode;
  }
  return listRows(GroomerWorkingHour, where, [
    ['groomerCode', 'ASC'],
    ['id', 'ASC'],
  ]);
}

export async function createGroomerHour(
  body: TenantInput & { groomerCode: string; dayOfWeek: string } & Record<string, unknown>
) {
  assertDay(body.dayOfWeek);
  const tenant = withTenant(body);
  await assertGroomerCode(body.groomerCode, tenant);
  return GroomerWorkingHour.create(tenant as never);
}

export async function updateGroomerHour(id: number, body: Record<string, unknown>) {
  assertDay(body.dayOfWeek as string | undefined);
  if (body.groomerCode) {
    await assertGroomerCode(String(body.groomerCode), body);
  }
  const row = await getRow(GroomerWorkingHour, id);
  await row.update(body);
  return row;
}

export async function deleteGroomerHour(id: number) {
  const row = await getRow(GroomerWorkingHour, id);
  await row.destroy();
}

export async function listUnavailability(query: TenantInput & { groomerCode?: string }) {
  const where: WhereOptions = { ...tenantFilter(query) };
  if (query.groomerCode) {
    (where as Record<string, unknown>).groomerCode = query.groomerCode;
  }
  return listRows(GroomerUnavailability, where, [
    ['startDate', 'ASC'],
    ['id', 'ASC'],
  ]);
}

export async function createUnavailability(
  body: TenantInput & { groomerCode: string } & Record<string, unknown>
) {
  const tenant = withTenant(body);
  await assertGroomerCode(body.groomerCode, tenant);
  return GroomerUnavailability.create(tenant as never);
}

export async function updateUnavailability(id: number, body: Record<string, unknown>) {
  if (body.groomerCode) {
    await assertGroomerCode(String(body.groomerCode), body);
  }
  const row = await getRow(GroomerUnavailability, id);
  await row.update(body);
  return row;
}

export async function deleteUnavailability(id: number) {
  const row = await getRow(GroomerUnavailability, id);
  await row.destroy();
}
