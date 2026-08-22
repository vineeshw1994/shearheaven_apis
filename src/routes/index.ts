import { Router } from 'express';
import authRoutes from './auth.routes';
import groomerAuthRoutes from './groomer-auth.routes';
import dataRoutes from './data.routes';
import petRoutes from './pet.routes';
import bookingRoutes from './booking.routes';
import availabilityRoutes from './availability.routes';
import scheduleRoutes from './schedule.routes';
import adminRoutes from './admin.routes';
import notificationRoutes from './notification.routes';
import offerRoutes from './offer.routes';
import chatRoutes from './chat.routes';
import contentRoutes from './content.routes';
import storeRoutes from './store.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/groomer-auth', groomerAuthRoutes);
router.use('/', dataRoutes);
router.use('/pets', petRoutes);
router.use('/bookings', bookingRoutes);
router.use('/availability', availabilityRoutes);
router.use('/groomer-availability', scheduleRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/offers', offerRoutes);
router.use('/chat', chatRoutes);
router.use('/content', contentRoutes);
router.use('/store', storeRoutes);

export default router;
