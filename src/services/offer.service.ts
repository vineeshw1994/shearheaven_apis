import { Op } from 'sequelize';
import { Offer } from '../models';
import { NotFoundError, ValidationError } from '../utils/response';
import { TenantInput } from '../utils/schedule';

function tenantFilter(query: TenantInput) {
  const tenant: Record<string, string> = {};
  if (query.ClientID || query.clientId) tenant.clientId = (query.ClientID || query.clientId) as string;
  if (query.RegionId || query.regionId) tenant.regionId = (query.RegionId || query.regionId) as string;
  if (query.StoreId || query.storeId) tenant.storeId = (query.StoreId || query.storeId) as string;
  return tenant;
}

export async function listOffers(query: TenantInput = {}) {
  const today = new Date().toISOString().slice(0, 10);
  return Offer.findAll({
    where: {
      isActive: true,
      ...tenantFilter(query),
      [Op.and]: [
        { [Op.or]: [{ startDate: null }, { startDate: { [Op.lte]: today } }] },
        { [Op.or]: [{ endDate: null }, { endDate: { [Op.gte]: today } }] },
      ],
    },
    order: [['id', 'DESC']],
  });
}

export async function validatePromoCode(
  promoCode: string,
  orderAmount: number,
  tenant: TenantInput = {}
): Promise<Record<string, unknown>> {
  const today = new Date().toISOString().slice(0, 10);
  const offer = await Offer.findOne({
    where: {
      promoCode,
      isActive: true,
      ...tenantFilter(tenant),
    },
  });
  if (!offer) throw new NotFoundError('Promo code not found');
  if (offer.startDate && offer.startDate > today) throw new ValidationError('Promo code is not active yet');
  if (offer.endDate && offer.endDate < today) throw new ValidationError('Promo code has expired');
  if (Number(offer.minOrderAmount) > orderAmount) {
    throw new ValidationError(`Minimum order amount is ${offer.minOrderAmount}`);
  }
  if (offer.maxUses && offer.usedCount >= offer.maxUses) {
    throw new ValidationError('Promo code usage limit reached');
  }

  let discountAmount = 0;
  if (offer.discountType === 'percentage') {
    discountAmount = (orderAmount * Number(offer.discountValue)) / 100;
  } else {
    discountAmount = Number(offer.discountValue);
  }

  return {
    valid: true,
    promoCode: offer.promoCode,
    title: offer.title,
    discountType: offer.discountType,
    discountValue: Number(offer.discountValue),
    discountAmount: Math.min(discountAmount, orderAmount),
    finalAmount: Math.max(0, orderAmount - discountAmount),
  };
}

export async function listAllOffers(query: TenantInput = {}) {
  return Offer.findAll({ where: tenantFilter(query), order: [['id', 'DESC']] });
}

export async function createOffer(body: Record<string, unknown>) {
  return Offer.create(body as never);
}

export async function updateOffer(id: number, body: Record<string, unknown>) {
  const row = await Offer.findByPk(id);
  if (!row) throw new NotFoundError('Offer not found');
  await row.update(body);
  return row;
}

export async function deleteOffer(id: number) {
  const row = await Offer.findByPk(id);
  if (!row) throw new NotFoundError('Offer not found');
  await row.destroy();
}
