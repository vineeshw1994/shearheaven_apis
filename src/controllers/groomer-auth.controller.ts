import { Response, NextFunction } from 'express';
import * as groomerAuthService from '../services/groomer-auth.service';
import { sendSuccess } from '../utils/response';
import { validateBody } from '../utils/validation';
import { GroomerAuthRequest } from '../types/groomer';
import * as bookingService from '../services/booking.service';
import Joi from 'joi';

const loginSchema = Joi.object({
  email: Joi.string().trim().required(),
  password: Joi.string().required(),
});

const setupAccountSchema = Joi.object({
  tempLoginId: Joi.string().trim().required(),
  tempPassword: Joi.string().required(),
  email: Joi.string().trim().email().required(),
  password: Joi.string().min(8).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Password and confirm password must match',
  }),
});

const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

const groomerCreateBookingSchema = Joi.object({
  userId: Joi.number().integer().positive().required(),
  petId: Joi.number().integer().positive().required(),
  serviceId: Joi.number().integer().positive().required(),
  packageId: Joi.number().integer().positive().allow(null).optional(),
  addOnIds: Joi.array().items(Joi.number().integer().positive()).optional(),
  bookingDate: Joi.string().required(),
  startTime: Joi.string().required(),
  endTime: Joi.string().required(),
  clientId: Joi.string().optional(),
  regionId: Joi.string().optional(),
  storeId: Joi.string().optional(),
});

const profileUpdateSchema = Joi.object({
  firstName: Joi.string().trim().max(100).optional(),
  lastName: Joi.string().trim().max(100).optional(),
  mobile: Joi.string().trim().max(20).allow('').optional(),
  password: Joi.string().min(6).optional(),
  multiBookingEnabled: Joi.boolean().optional(),
  slotBookingLimit: Joi.number().integer().min(1).max(20).optional(),
}).min(1);

export async function login(req: GroomerAuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<groomerAuthService.GroomerLoginInput>(loginSchema, req.body);
    const result = await groomerAuthService.loginGroomer(data);
    sendSuccess(res, 'Groomer logged in successfully', result);
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req: GroomerAuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const profile = await groomerAuthService.getGroomerProfile(req.groomer!.id);
    sendSuccess(res, 'Groomer profile retrieved successfully', profile);
  } catch (error) {
    next(error);
  }
}

export async function updateProfile(req: GroomerAuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<groomerAuthService.GroomerProfileUpdateInput>(profileUpdateSchema, req.body);
    const profile = await groomerAuthService.updateGroomerProfile(req.groomer!.id, data);
    sendSuccess(res, 'Groomer profile updated successfully', profile);
  } catch (error) {
    next(error);
  }
}

export async function getPendingBookings(req: GroomerAuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const bookings = await groomerAuthService.getGroomerPendingBookings(req.groomer!.id);
    sendSuccess(res, 'Pending booking requests retrieved successfully', bookings);
  } catch (error) {
    next(error);
  }
}

export async function getUpcomingBookings(req: GroomerAuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const bookings = await groomerAuthService.getGroomerUpcomingBookings(req.groomer!.id);
    sendSuccess(res, 'Upcoming bookings retrieved successfully', bookings);
  } catch (error) {
    next(error);
  }
}

export async function getPastBookings(req: GroomerAuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const bookings = await groomerAuthService.getGroomerPastBookings(req.groomer!.id);
    sendSuccess(res, 'Past bookings retrieved successfully', bookings);
  } catch (error) {
    next(error);
  }
}

export async function getCancelledBookings(req: GroomerAuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const bookings = await groomerAuthService.getGroomerCancelledBookings(req.groomer!.id);
    sendSuccess(res, 'Cancelled bookings retrieved successfully', bookings);
  } catch (error) {
    next(error);
  }
}

export async function getCancellationRequests(req: GroomerAuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const bookings = await groomerAuthService.getGroomerCancellationRequests(req.groomer!.id);
    sendSuccess(res, 'Cancellation requests retrieved successfully', bookings);
  } catch (error) {
    next(error);
  }
}

export async function approveBooking(req: GroomerAuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const booking = await groomerAuthService.approveBooking(req.groomer!.id, Number(req.params.id));
    sendSuccess(res, 'Booking approved successfully', booking);
  } catch (error) {
    next(error);
  }
}

export async function rejectBooking(req: GroomerAuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const booking = await groomerAuthService.rejectBooking(req.groomer!.id, Number(req.params.id));
    sendSuccess(res, 'Booking rejected successfully', booking);
  } catch (error) {
    next(error);
  }
}

export async function approveCancellation(req: GroomerAuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const booking = await groomerAuthService.approveCancellation(req.groomer!.id, Number(req.params.id));
    sendSuccess(res, 'Cancellation approved successfully', booking);
  } catch (error) {
    next(error);
  }
}

export async function rejectCancellation(req: GroomerAuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const booking = await groomerAuthService.rejectCancellation(req.groomer!.id, Number(req.params.id));
    sendSuccess(res, 'Cancellation rejected successfully', booking);
  } catch (error) {
    next(error);
  }
}

export async function setupAccount(req: GroomerAuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<groomerAuthService.GroomerSetupAccountInput & { confirmPassword: string }>(
      setupAccountSchema,
      req.body
    );
    const result = await groomerAuthService.setupGroomerAccount(data);
    sendSuccess(res, 'Groomer account setup completed successfully', result);
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req: GroomerAuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = validateBody<{ refreshToken: string }>(refreshSchema, req.body);
    const result = await groomerAuthService.refreshGroomerAccessToken(refreshToken);
    sendSuccess(res, 'Groomer access token refreshed successfully', result);
  } catch (error) {
    next(error);
  }
}

export async function createBookingForUser(req: GroomerAuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<bookingService.GroomerCreateBookingInput>(groomerCreateBookingSchema, req.body);
    const booking = await bookingService.createBookingByGroomer(req.groomer!.id, data, {
      clientId: req.groomer!.clientId,
      regionId: req.groomer!.regionId,
      storeId: req.groomer!.storeId,
    });
    sendSuccess(res, 'Booking created successfully for user', booking, 201);
  } catch (error) {
    next(error);
  }
}
