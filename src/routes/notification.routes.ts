import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, notificationController.listNotifications);
router.put('/:id/read', authenticate, notificationController.markRead);
router.put('/read-all', authenticate, notificationController.markAllRead);
router.delete('/:id', authenticate, notificationController.deleteNotification);
router.post('/device-token', authenticate, notificationController.registerDeviceToken);

export default router;
