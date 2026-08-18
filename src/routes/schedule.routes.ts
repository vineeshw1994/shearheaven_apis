import { Router } from 'express';
import * as scheduleController from '../controllers/schedule.controller';

const router = Router();

/**
 * @swagger
 * /api/groomer-availability:
 *   get:
 *     tags: [Groomer Availability]
 *     summary: Get availability for all, one, or selected groomers
 *     description: Uses holiday list, store operational hours, groomer working hours, and unavailability. Existing /api/availability is unchanged.
 *     parameters:
 *       - in: query
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           example: "2026-08-19"
 *       - in: query
 *         name: groomerId
 *         schema:
 *           type: integer
 *         description: Single groomer id
 *       - in: query
 *         name: groomerIds
 *         schema:
 *           type: string
 *           example: "1,2"
 *         description: Comma-separated groomer ids for selected groomers
 *       - in: query
 *         name: durationMinutes
 *         schema:
 *           type: integer
 *           default: 15
 *       - in: query
 *         name: ClientID
 *         schema:
 *           type: string
 *       - in: query
 *         name: RegionId
 *         schema:
 *           type: string
 *       - in: query
 *         name: StoreId
 *         schema:
 *           type: string
 *   post:
 *     tags: [Groomer Availability]
 *     summary: Get availability for all, one, or selected groomers
 */
router.get('/', scheduleController.getGroomerAvailability);
router.post('/', scheduleController.getGroomerAvailability);

export default router;
