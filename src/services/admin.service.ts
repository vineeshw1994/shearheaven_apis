import { Model, ModelStatic, WhereOptions } from 'sequelize';
import {
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

export async function listGroomers(query: TenantInput) {
  return listRows(Groomer, tenantFilter(query), [['id', 'ASC']]);
}

export async function createGroomer(body: TenantInput & Record<string, unknown>) {
  return Groomer.create(withTenant(body) as never);
}

export async function updateGroomer(id: number, body: Record<string, unknown>) {
  const row = await getRow(Groomer, id);
  await row.update(body);
  return row;
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

export async function listGroomerHours(query: TenantInput & { groomerId?: number }) {
  const where: WhereOptions = { ...tenantFilter(query) };
  if (query.groomerId) {
    (where as Record<string, unknown>).groomerId = query.groomerId;
  }
  return listRows(GroomerWorkingHour, where, [
    ['groomerId', 'ASC'],
    ['id', 'ASC'],
  ]);
}

export async function createGroomerHour(
  body: TenantInput & { groomerId: number; dayOfWeek: string } & Record<string, unknown>
) {
  assertDay(body.dayOfWeek);
  await getRow(Groomer, body.groomerId);
  return GroomerWorkingHour.create(withTenant(body) as never);
}

export async function updateGroomerHour(id: number, body: Record<string, unknown>) {
  assertDay(body.dayOfWeek as string | undefined);
  if (body.groomerId) {
    await getRow(Groomer, Number(body.groomerId));
  }
  const row = await getRow(GroomerWorkingHour, id);
  await row.update(body);
  return row;
}

export async function deleteGroomerHour(id: number) {
  const row = await getRow(GroomerWorkingHour, id);
  await row.destroy();
}

export async function listUnavailability(query: TenantInput & { groomerId?: number }) {
  const where: WhereOptions = { ...tenantFilter(query) };
  if (query.groomerId) {
    (where as Record<string, unknown>).groomerId = query.groomerId;
  }
  return listRows(GroomerUnavailability, where, [
    ['startDate', 'ASC'],
    ['id', 'ASC'],
  ]);
}

export async function createUnavailability(
  body: TenantInput & { groomerId: number } & Record<string, unknown>
) {
  await getRow(Groomer, body.groomerId);
  return GroomerUnavailability.create(withTenant(body) as never);
}

export async function updateUnavailability(id: number, body: Record<string, unknown>) {
  if (body.groomerId) {
    await getRow(Groomer, Number(body.groomerId));
  }
  const row = await getRow(GroomerUnavailability, id);
  await row.update(body);
  return row;
}

export async function deleteUnavailability(id: number) {
  const row = await getRow(GroomerUnavailability, id);
  await row.destroy();
}
