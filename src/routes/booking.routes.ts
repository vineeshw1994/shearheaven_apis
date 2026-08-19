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

/**
 * @swagger
 * /api/bookings/upcoming:
 *   get:
 *     tags: [Bookings]
 *     summary: List the authenticated user's upcoming bookings
 *     security:
 *       - bearerAuth: []
 */
router.get('/upcoming', authenticate, bookingController.getUpcomingBookings);

/**
 * @swagger
 * /api/bookings/past:
 *   get:
 *     tags: [Bookings]
 *     summary: List the authenticated user's past bookings
 *     security:
 *       - bearerAuth: []
 */
router.get('/past', authenticate, bookingController.getPastBookings);

/**
 * @swagger
 * /api/bookings/cancelled:
 *   get:
 *     tags: [Bookings]
 *     summary: List the authenticated user's cancelled bookings
 *     security:
 *       - bearerAuth: []
 */
router.get('/cancelled', authenticate, bookingController.getCancelledBookings);

/**
 * @swagger
 * /api/bookings/{id}/cancel:
 *   post:
 *     tags: [Bookings]
 *     summary: Cancel an upcoming booking
 *     security:
 *       - bearerAuth: []
 */
router.post('/:id/cancel', authenticate, bookingController.cancelBooking);

export default router;
