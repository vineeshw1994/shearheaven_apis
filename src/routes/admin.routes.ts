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
router.get('/clients', adminController.listClients);
router.post('/clients', adminController.createClient);
router.put('/clients/:id', adminController.updateClient);
router.delete('/clients/:id', adminController.deleteClient);

router.get('/regions', adminController.listRegions);
router.post('/regions', adminController.createRegion);
router.put('/regions/:id', adminController.updateRegion);
router.delete('/regions/:id', adminController.deleteRegion);

router.get('/stores', adminController.listStores);
router.post('/stores', adminController.createStore);
router.put('/stores/:id', adminController.updateStore);
router.delete('/stores/:id', adminController.deleteStore);

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

router.get('/groomer-bookings/:groomerId', adminController.getGroomerBookings);
router.post('/groomer-bookings/:bookingId/approve', adminController.approveGroomerBooking);
router.post('/groomer-bookings/:bookingId/reject', adminController.rejectGroomerBooking);
router.post('/groomer-bookings/:bookingId/complete', adminController.completeGroomerBooking);

router.get('/discounts', adminController.listDiscountsAdmin);
router.post('/discounts', adminController.createDiscount);
router.put('/discounts/:id', adminController.updateDiscount);
router.delete('/discounts/:id', adminController.deleteDiscount);

router.get('/catalog/services', adminController.listCatalogServices);

router.get('/offers', adminController.listOffersAdmin);
router.post('/offers', adminController.createOffer);
router.put('/offers/:id', adminController.updateOffer);
router.delete('/offers/:id', adminController.deleteOffer);

router.get('/store-content', adminController.listStoreContentAdmin);
router.post('/store-content', adminController.upsertStoreContent);
router.put('/store-content/:id', adminController.upsertStoreContent);
router.delete('/store-content/:id', adminController.deleteStoreContent);

export default router;
