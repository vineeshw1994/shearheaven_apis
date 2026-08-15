import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /api/availability:
 *   post:
 *     tags: [Bookings]
 *     summary: Get groomer availability and open time slots
 *     security:
 *       - bearerAuth: []
 *   get:
 *     tags: [Bookings]
 *     summary: Get groomer availability and open time slots
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, bookingController.getAvailability);
router.get('/', authenticate, bookingController.getAvailability);

export default router;
