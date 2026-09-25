import { Op } from 'sequelize';
import { Groomer, User } from '../models';
import { ForbiddenError, NotFoundError } from '../utils/response';
import { getCatalogGroomers, getGroomerById } from './catalog.service';
import { getAvailability, AvailabilityInput } from './booking.service';
import { getUserPets } from './pet.service';

export interface GroomerShopContext {
  id: number;
  groomerCode: string;
  clientId: string;
  regionId: string;
  storeId: string;
}

function buildStoreFilter(groomer: GroomerShopContext): Record<string, string> {
  const where: Record<string, string> = {};
  if (groomer.clientId) where.clientId = groomer.clientId;
  if (groomer.regionId) where.regionId = groomer.regionId;
  if (groomer.storeId) where.storeId = groomer.storeId;
  return where;
}

async function assertCustomerInShop(groomer: GroomerShopContext, userId: number): Promise<User> {
  const user = await User.findOne({
    where: { id: userId, ...buildStoreFilter(groomer) },
    attributes: ['id', 'name', 'email', 'mobile', 'emailVerified', 'clientId', 'regionId', 'storeId'],
  });
  if (!user) {
    throw new NotFoundError('Customer not found in your shop');
  }
  return user;
}

export async function assertCatalogGroomerInShop(
  groomer: GroomerShopContext,
  catalogGroomerId: number
): Promise<void> {
  const catalogGroomer = getGroomerById(catalogGroomerId);
  const storeFilter = buildStoreFilter(groomer);
  const dbGroomer = await Groomer.findOne({
    where: {
      groomerCode: catalogGroomer.code,
      isActive: true,
      ...storeFilter,
    },
  });
  if (!dbGroomer) {
    throw new ForbiddenError('Groomer is not available in your shop');
  }
}

export async function listShopCustomers(
  groomer: GroomerShopContext,
  options: { search?: string; limit?: number; offset?: number }
): Promise<{ total: number; customers: Record<string, unknown>[] }> {
  const storeFilter = buildStoreFilter(groomer);
  const search = options.search?.trim();
  const where = search
    ? {
        ...storeFilter,
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { mobile: { [Op.like]: `%${search}%` } },
        ],
      }
    : storeFilter;

  const limit = Math.min(Math.max(options.limit ?? 50, 1), 100);
  const offset = Math.max(options.offset ?? 0, 0);

  const { count, rows } = await User.findAndCountAll({
    where,
    order: [['name', 'ASC']],
    limit,
    offset,
    attributes: ['id', 'name', 'email', 'mobile', 'emailVerified', 'clientId', 'regionId', 'storeId'],
  });

  return {
    total: count,
    customers: rows.map((user) => user.toJSON() as Record<string, unknown>),
  };
}

export async function listShopCustomerPets(
  groomer: GroomerShopContext,
  userId: number
): Promise<Record<string, unknown>[]> {
  await assertCustomerInShop(groomer, userId);
  return getUserPets(userId);
}

export async function listShopGroomers(groomer: GroomerShopContext): Promise<Record<string, unknown>[]> {
  const storeFilter = buildStoreFilter(groomer);
  const rows = await Groomer.findAll({
    where: { isActive: true, ...storeFilter },
    order: [['groomerCode', 'ASC']],
  });
  const catalog = getCatalogGroomers();

  const result: Record<string, unknown>[] = [];
  for (const row of rows) {
    const catalogGroomer = catalog.find((item) => item.code === row.groomerCode);
    if (!catalogGroomer) {
      continue;
    }
    result.push({
      dbId: row.id,
      groomerId: catalogGroomer.id,
      groomerCode: row.groomerCode,
      firstName: row.firstName,
      lastName: row.lastName,
      name: `${row.firstName} ${row.lastName}`.trim(),
      type: row.type,
      role: catalogGroomer.role,
      isSelf: row.id === groomer.id,
    });
  }
  return result;
}

export async function getShopGroomerAvailability(
  groomer: GroomerShopContext,
  catalogGroomerId: number,
  input: Omit<AvailabilityInput, 'groomerId'>
): Promise<Record<string, unknown>> {
  await assertCatalogGroomerInShop(groomer, catalogGroomerId);

  return getAvailability({
    ...input,
    groomerId: catalogGroomerId,
    clientId: input.clientId || input.ClientId || groomer.clientId,
    regionId: input.regionId || input.RegionId || groomer.regionId,
    storeId: input.storeId || input.StoreId || groomer.storeId,
  });
}
