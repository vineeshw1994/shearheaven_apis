import { Op } from 'sequelize';
import { Notification, NotificationDeviceToken } from '../models';
import { NotFoundError } from '../utils/response';
import { emitNotificationToGroomer, emitNotificationToUser } from '../config/socket';

export interface CreateNotificationInput {
  userId?: number | null;
  groomerId?: number | null;
  title: string;
  message: string;
  type?: string;
  data?: Record<string, unknown>;
  clientId?: string;
  regionId?: string;
  storeId?: string;
}

export async function createNotification(input: CreateNotificationInput): Promise<Record<string, unknown>> {
  const notification = await Notification.create({
    userId: input.userId || null,
    groomerId: input.groomerId || null,
    title: input.title,
    message: input.message,
    type: input.type || 'general',
    data: input.data || {},
    clientId: input.clientId || '',
    regionId: input.regionId || '',
    storeId: input.storeId || '',
  });

  const payload = {
    id: notification.id,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    data: notification.data,
    isRead: notification.isRead,
    createdAt: (notification as unknown as { createdAt?: Date }).createdAt,
  };

  if (input.userId) {
    emitNotificationToUser(input.userId, payload);
  }
  if (input.groomerId) {
    emitNotificationToGroomer(input.groomerId, payload);
  }

  return payload;
}

export async function listNotifications(userId: number): Promise<Record<string, unknown>[]> {
  const rows = await Notification.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
  });
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    message: row.message,
    type: row.type,
    data: row.data,
    isRead: row.isRead,
    createdAt: (row as unknown as { createdAt?: Date }).createdAt,
  }));
}

export async function markNotificationRead(userId: number, id: number): Promise<Record<string, unknown>> {
  const row = await Notification.findOne({ where: { id, userId } });
  if (!row) throw new NotFoundError('Notification not found');
  await row.update({ isRead: true });
  return { id: row.id, isRead: true };
}

export async function markAllNotificationsRead(userId: number) {
  await Notification.update({ isRead: true }, { where: { userId, isRead: false } });
  return { updated: true };
}

export async function deleteNotification(userId: number, id: number) {
  const row = await Notification.findOne({ where: { id, userId } });
  if (!row) throw new NotFoundError('Notification not found');
  await row.destroy();
  return { deleted: true };
}

export async function registerDeviceToken(
  userId: number,
  input: { deviceId: string; pushToken: string; platform?: string }
): Promise<Record<string, unknown>> {
  const existing = await NotificationDeviceToken.findOne({
    where: { deviceId: input.deviceId, pushToken: input.pushToken },
  });
  if (existing) {
    await existing.update({ userId, platform: input.platform || 'android' });
    return existing.toJSON() as Record<string, unknown>;
  }
  const created = await NotificationDeviceToken.create({
    userId,
    deviceId: input.deviceId,
    pushToken: input.pushToken,
    platform: input.platform || 'android',
  });
  return created.toJSON() as Record<string, unknown>;
}
