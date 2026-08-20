import { Response, NextFunction } from 'express';
import * as groomerAuthService from '../services/groomer-auth.service';
import { sendSuccess } from '../utils/response';
import { validateBody } from '../utils/validation';
import { GroomerAuthRequest } from '../types/groomer';
import Joi from 'joi';

const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required(),
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
