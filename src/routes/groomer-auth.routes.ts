import { Router } from 'express';
import * as groomerAuthController from '../controllers/groomer-auth.controller';
import { authenticateGroomer } from '../middleware/groomer-auth.middleware';

const router = Router();

router.post('/login', groomerAuthController.login);
router.post('/setup-account', groomerAuthController.setupAccount);
router.post('/refresh-token', groomerAuthController.refreshToken);
router.get('/profile', authenticateGroomer, groomerAuthController.getProfile);
router.put('/profile', authenticateGroomer, groomerAuthController.updateProfile);
router.post('/device-token', authenticateGroomer, groomerAuthController.registerDeviceToken);

router.get('/customers', authenticateGroomer, groomerAuthController.listShopCustomers);
router.get('/customers/:userId/pets', authenticateGroomer, groomerAuthController.listShopCustomerPets);
router.get('/groomers', authenticateGroomer, groomerAuthController.listShopGroomers);
router.get('/groomers/:groomerId/availability', authenticateGroomer, groomerAuthController.getShopGroomerAvailability);
router.post('/groomers/:groomerId/availability', authenticateGroomer, groomerAuthController.getShopGroomerAvailability);

router.get('/bookings/pending', authenticateGroomer, groomerAuthController.getPendingBookings);
router.get('/bookings/upcoming', authenticateGroomer, groomerAuthController.getUpcomingBookings);
router.get('/bookings/past', authenticateGroomer, groomerAuthController.getPastBookings);
router.get('/bookings/cancelled', authenticateGroomer, groomerAuthController.getCancelledBookings);
router.get('/bookings/cancellation-requests', authenticateGroomer, groomerAuthController.getCancellationRequests);

router.post('/bookings/:id/approve', authenticateGroomer, groomerAuthController.approveBooking);
router.post('/bookings/:id/reject', authenticateGroomer, groomerAuthController.rejectBooking);
router.post('/bookings/:id/start', authenticateGroomer, groomerAuthController.startBooking);
router.post('/bookings/:id/complete', authenticateGroomer, groomerAuthController.completeBooking);
router.post('/bookings/:id/approve-cancellation', authenticateGroomer, groomerAuthController.approveCancellation);
router.post('/bookings/:id/reject-cancellation', authenticateGroomer, groomerAuthController.rejectCancellation);
router.post('/bookings/create-for-user', authenticateGroomer, groomerAuthController.createBookingForUser);

export default router;
