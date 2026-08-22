import { Response, NextFunction } from 'express';
import * as notificationService from '../services/notification.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types/express';
import { validateBody } from '../utils/validation';
import Joi from 'joi';

const deviceTokenSchema = Joi.object({
  deviceId: Joi.string().trim().required(),
  pushToken: Joi.string().trim().required(),
  platform: Joi.string().valid('android', 'ios', 'web').optional(),
});

export async function listNotifications(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const rows = await notificationService.listNotifications(req.user!.id);
    sendSuccess(res, 'Notifications retrieved successfully', rows);
  } catch (error) {
    next(error);
  }
}

export async function markRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await notificationService.markNotificationRead(req.user!.id, Number(req.params.id));
    sendSuccess(res, 'Notification marked as read', row);
  } catch (error) {
    next(error);
  }
}

export async function markAllRead(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await notificationService.markAllNotificationsRead(req.user!.id);
    sendSuccess(res, 'All notifications marked as read', result);
  } catch (error) {
    next(error);
  }
}

export async function deleteNotification(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await notificationService.deleteNotification(req.user!.id, Number(req.params.id));
    sendSuccess(res, 'Notification deleted successfully', result);
  } catch (error) {
    next(error);
  }
}

export async function registerDeviceToken(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<{ deviceId: string; pushToken: string; platform?: string }>(
      deviceTokenSchema,
      req.body
    );
    const row = await notificationService.registerDeviceToken(req.user!.id, data);
    sendSuccess(res, 'Device token registered successfully', row, 201);
  } catch (error) {
    next(error);
  }
}
