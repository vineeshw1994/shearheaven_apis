import { Op } from 'sequelize';
import { Discount } from '../models';
import { NotFoundError, ValidationError } from '../utils/response';
import { TenantInput } from '../utils/schedule';

function tenantFilter(query: TenantInput) {
  const tenant: Record<string, string> = {};
  if (query.ClientID || query.clientId) tenant.clientId = (query.ClientID || query.clientId) as string;
  if (query.RegionId || query.regionId) tenant.regionId = (query.RegionId || query.regionId) as string;
  if (query.StoreId || query.storeId) tenant.storeId = (query.StoreId || query.storeId) as string;
  return tenant;
}

export async function listDiscounts(query: TenantInput = {}) {
  return Discount.findAll({
    where: { ...tenantFilter(query), isActive: true },
    order: [['id', 'DESC']],
  });
}

export async function listAllDiscounts(query: TenantInput = {}) {
  return Discount.findAll({
    where: tenantFilter(query),
    order: [['id', 'DESC']],
  });
}

export async function createDiscount(body: Record<string, unknown>) {
  return Discount.create(body as never);
}

export async function updateDiscount(id: number, body: Record<string, unknown>) {
  const row = await Discount.findByPk(id);
  if (!row) throw new NotFoundError('Discount not found');
  await row.update(body);
  return row;
}

export async function deleteDiscount(id: number) {
  const row = await Discount.findByPk(id);
  if (!row) throw new NotFoundError('Discount not found');
  await row.destroy();
}

export async function getApplicableDiscount(code: string, serviceId: number, orderAmount: number, tenant: TenantInput = {}) {
  const today = new Date().toISOString().slice(0, 10);
  const row = await Discount.findOne({
    where: {
      code,
      isActive: true,
      ...tenantFilter(tenant),
      [Op.or]: [{ startDate: null }, { startDate: { [Op.lte]: today } }],
    },
  });
  if (!row) throw new NotFoundError('Discount not found');
  if (row.endDate && row.endDate < today) throw new ValidationError('Discount has expired');
  if (Number(row.minOrderAmount) > orderAmount) {
    throw new ValidationError(`Minimum order amount is ${row.minOrderAmount}`);
  }
  if (row.serviceIds?.length && !row.serviceIds.includes(serviceId)) {
    throw new ValidationError('Discount not applicable for this service');
  }
  return row;
}
