import { Router } from 'express';
import * as dataController from '../controllers/data.controller';

const router = Router();

/**
 * @swagger
 * /api/groomers:
 *   get:
 *     tags: [Groomers]
 *     summary: Get groomer list
 *     responses:
 *       200:
 *         description: Groomer list retrieved
 */
router.get('/groomers', dataController.getGroomers);

/**
 * @swagger
 * /api/holidays:
 *   get:
 *     tags: [Holidays]
 *     summary: Get US holidays list
 */
router.get('/holidays', dataController.getHolidays);

/**
 * @swagger
 * /api/service-hours:
 *   get:
 *     tags: [Service Hours]
 *     summary: Get service hours
 */
router.get('/service-hours', dataController.getServiceHours);

/**
 * @swagger
 * /api/breeds:
 *   get:
 *     tags: [Breeds]
 *     summary: Get breed list
 */
router.get('/breeds', dataController.getBreeds);

/**
 * @swagger
 * /api/pet-weights:
 *   get:
 *     tags: [Pet Weights]
 *     summary: Get pet weight ranges
 */
router.get('/pet-weights', dataController.getPetWeights);

/**
 * @swagger
 * /api/service-packages:
 *   get:
 *     tags: [Services & Packages]
 *     summary: Get services, packages, add-ons, and walk-in services
 */
router.get('/service-packages', dataController.getServicesAndPackages);

export default router;
