import { Router } from 'express';
import * as adminController from '../controllers/admin.controller';

const router = Router();

/**
 * @swagger
 * /api/admin/groomers:
 *   get:
 *     tags: [Admin]
 *     summary: List groomers
 *   post:
 *     tags: [Admin]
 *     summary: Create a groomer
 */
router.get('/groomers', adminController.listGroomers);
router.post('/groomers', adminController.createGroomer);
router.put('/groomers/:id', adminController.updateGroomer);
router.delete('/groomers/:id', adminController.deleteGroomer);

router.get('/holidays', adminController.listHolidays);
router.post('/holidays', adminController.createHoliday);
router.put('/holidays/:id', adminController.updateHoliday);
router.delete('/holidays/:id', adminController.deleteHoliday);

router.get('/store-hours', adminController.listStoreHours);
router.post('/store-hours', adminController.createStoreHour);
router.put('/store-hours/:id', adminController.updateStoreHour);
router.delete('/store-hours/:id', adminController.deleteStoreHour);

router.get('/groomer-hours', adminController.listGroomerHours);
router.post('/groomer-hours', adminController.createGroomerHour);
router.put('/groomer-hours/:id', adminController.updateGroomerHour);
router.delete('/groomer-hours/:id', adminController.deleteGroomerHour);

router.get('/groomer-unavailability', adminController.listUnavailability);
router.post('/groomer-unavailability', adminController.createUnavailability);
router.put('/groomer-unavailability/:id', adminController.updateUnavailability);
router.delete('/groomer-unavailability/:id', adminController.deleteUnavailability);

export default router;
