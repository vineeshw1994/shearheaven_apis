import { Op } from 'sequelize';
import { LoginDevice, User } from '../models';
import { LoginUserType } from '../models/LoginDevice';
import { generateDeviceAccessToken, generateAccessToken, generateRefreshToken, getRefreshTokenExpiryDate } from '../utils/jwt';
import { hashToken } from '../utils/crypto';
import { RefreshToken } from '../models';
import { NotFoundError, UnauthorizedError } from '../utils/response';

const MAX_DEVICES = 5;

export interface ValidateDeviceInput {
  deviceId: string;
  userType: LoginUserType;
  userId?: number;
  clientId?: string;
  regionId?: string;
  storeId?: string;
}

export async function registerDevice(
  deviceId: string,
  userType: LoginUserType,
  userId: number | null,
  tenant: { clientId?: string; regionId?: string; storeId?: string } = {}
): Promise<LoginDevice> {
  const whereBase: Record<string, unknown> = { userType, deviceId };
  if (userId) {
    whereBase.userId = userId;
  } else {
    whereBase.userId = { [Op.or]: [null, 0] };
  }

  const existing = await LoginDevice.findOne({ where: whereBase });
  if (existing) {
    await existing.update({ lastLoggedInAt: new Date() });
    return existing;
  }

  const ownerWhere: Record<string, unknown> = { userType };
  if (userId) {
    ownerWhere.userId = userId;
  } else {
    ownerWhere.userId = { [Op.or]: [null, 0] };
  }

  const devices = await LoginDevice.findAll({
    where: ownerWhere,
    order: [['lastLoggedInAt', 'ASC']],
  });

  if (devices.length >= MAX_DEVICES) {
    await devices[0].destroy();
  }

  return LoginDevice.create({
    userId: userId || null,
    userType,
    deviceId,
    lastLoggedInAt: new Date(),
    clientId: tenant.clientId || '',
    regionId: tenant.regionId || '',
    storeId: tenant.storeId || '',
  });
}

export async function validateDeviceUser(input: ValidateDeviceInput): Promise<Record<string, unknown>> {
  const where: Record<string, unknown> = {
    deviceId: input.deviceId,
    userType: input.userType,
  };

  if (input.userId) {
    where.userId = input.userId;
  }

  const device = await LoginDevice.findOne({ where, order: [['lastLoggedInAt', 'DESC']] });

  if (!device) {
    if (input.userType === 'guest') {
      await registerDevice(input.deviceId, 'guest', null, input);
      const accessToken = generateDeviceAccessToken({
        deviceId: input.deviceId,
        userType: 'guest',
      });
      return { valid: true, exists: true, accessToken, userType: 'guest' };
    }
    return { valid: false, exists: false };
  }

  await device.update({ lastLoggedInAt: new Date() });

  const accessToken = generateDeviceAccessToken({
    deviceId: input.deviceId,
    userType: input.userType,
    userId: device.userId || undefined,
  });

  let refreshToken: string | undefined;
  if (device.userId && input.userType === 'registered') {
    const user = await User.findByPk(device.userId);
    if (user) {
      const refreshRecord = await RefreshToken.create({
        userId: user.id,
        tokenHash: '',
        expiresAt: getRefreshTokenExpiryDate(),
        clientId: user.clientId,
        regionId: user.regionId,
        storeId: user.storeId,
      });
      refreshToken = generateRefreshToken({ userId: user.id, tokenId: refreshRecord.id });
      await refreshRecord.update({ tokenHash: await hashToken(refreshToken) });
    }
  }

  return {
    valid: true,
    exists: true,
    accessToken,
    refreshToken,
    userId: device.userId,
    userType: input.userType,
    lastLoggedInAt: device.lastLoggedInAt,
  };
}

export async function verifyDeviceToken(deviceId: string, userType: LoginUserType, userId?: number): Promise<boolean> {
  const where: Record<string, unknown> = { deviceId, userType };
  if (userId) where.userId = userId;
  const device = await LoginDevice.findOne({ where });
  return Boolean(device);
}

export async function generateDeviceTokenForUser(
  user: User,
  deviceId: string,
  userType: LoginUserType = 'registered'
): Promise<Record<string, unknown>> {
  await registerDevice(deviceId, userType, user.id, {
    clientId: user.clientId,
    regionId: user.regionId,
    storeId: user.storeId,
  });

  const accessToken = generateDeviceAccessToken({
    deviceId,
    userType,
    userId: user.id,
  });

  const refreshRecord = await RefreshToken.create({
    userId: user.id,
    tokenHash: '',
    expiresAt: getRefreshTokenExpiryDate(),
    clientId: user.clientId,
    regionId: user.regionId,
    storeId: user.storeId,
  });
  const refreshToken = generateRefreshToken({ userId: user.id, tokenId: refreshRecord.id });
  await refreshRecord.update({ tokenHash: await hashToken(refreshToken) });

  return {
    deviceAccessToken: accessToken,
    accessToken: generateAccessToken({ userId: user.id, email: user.email }),
    refreshToken,
  };
}
