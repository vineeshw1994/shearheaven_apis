import { Router } from 'express';
import * as bookingController from '../controllers/booking.controller';
import { authenticate } from '../middleware/auth.middleware';
import { createBookingSchema } from '../utils/validation';
import { validate } from '../middleware/validate.middleware';

const router = Router();

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     tags: [Bookings]
 *     summary: Create a grooming booking
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, validate(createBookingSchema), bookingController.createBooking);

export default router;
