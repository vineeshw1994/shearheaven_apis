import { Router } from 'express';
import authRoutes from './auth.routes';
import dataRoutes from './data.routes';
import petRoutes from './pet.routes';
import bookingRoutes from './booking.routes';
import availabilityRoutes from './availability.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/', dataRoutes);
router.use('/pets', petRoutes);
router.use('/bookings', bookingRoutes);
router.use('/availability', availabilityRoutes);

export default router;
