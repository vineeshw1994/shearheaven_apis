import { Router } from 'express';
import authRoutes from './auth.routes';
import groomerAuthRoutes from './groomer-auth.routes';
import dataRoutes from './data.routes';
import petRoutes from './pet.routes';
import bookingRoutes from './booking.routes';
import availabilityRoutes from './availability.routes';
import scheduleRoutes from './schedule.routes';
import adminRoutes from './admin.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/groomer-auth', groomerAuthRoutes);
router.use('/', dataRoutes);
router.use('/pets', petRoutes);
router.use('/bookings', bookingRoutes);
router.use('/availability', availabilityRoutes);
router.use('/groomer-availability', scheduleRoutes);
router.use('/admin', adminRoutes);

export default router;
