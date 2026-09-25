import { Response, NextFunction } from 'express';
import * as groomerAuthService from '../services/groomer-auth.service';
import { sendSuccess } from '../utils/response';
import { validateBody } from '../utils/validation';
import { GroomerAuthRequest } from '../types/groomer';
import * as bookingService from '../services/booking.service';
import * as notificationService from '../services/notification.service';
import * as groomerBookingAssistService from '../services/groomer-booking-assist.service';
import { AvailabilityInput } from '../services/booking.service';
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

const deviceTokenSchema = Joi.object({
  deviceId: Joi.string().trim().required(),
  pushToken: Joi.string().trim().required(),
  platform: Joi.string().valid('android', 'ios', 'web').optional(),
});

const shopCustomerListQuerySchema = Joi.object({
  search: Joi.string().trim().max(100).allow('').optional(),
  limit: Joi.number().integer().min(1).max(100).optional(),
  offset: Joi.number().integer().min(0).optional(),
});

const groomerShopAvailabilitySchema = Joi.object({
  date: Joi.string()
    .pattern(/^\d{4}-\d{2}-\d{2}$/)
    .required()
    .messages({
      'string.pattern.base': 'date must be in YYYY-MM-DD format',
    }),
  serviceId: Joi.number().integer().positive().required(),
  packageId: Joi.number().integer().positive().allow(null).optional(),
  addOnIds: Joi.array().items(Joi.number().integer().positive()).default([]),
  clientId: Joi.string().optional(),
  regionId: Joi.string().optional(),
  storeId: Joi.string().optional(),
  ClientId: Joi.string().optional(),
  RegionId: Joi.string().optional(),
  StoreId: Joi.string().optional(),
});

function parseAvailabilityQuery(req: GroomerAuthRequest): Record<string, unknown> {
  const queryAddOnIds = req.query.addOnIds;
  return {
    ...req.query,
    ...req.body,
    addOnIds:
      req.body?.addOnIds ||
      (typeof queryAddOnIds === 'string'
        ? queryAddOnIds.split(',').filter(Boolean).map((id: string) => Number(id))
        : queryAddOnIds),
    serviceId: req.body?.serviceId || req.query.serviceId,
    packageId: req.body?.packageId ?? req.query.packageId,
    date: req.body?.date || req.query.date,
  };
}

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

export async function startBooking(req: GroomerAuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const booking = await groomerAuthService.startBooking(req.groomer!.id, Number(req.params.id));
    sendSuccess(res, 'Appointment started successfully', booking);
  } catch (error) {
    next(error);
  }
}

export async function completeBooking(req: GroomerAuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const booking = await groomerAuthService.completeBooking(req.groomer!.id, Number(req.params.id));
    sendSuccess(res, 'Appointment completed successfully', booking);
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

export async function listShopCustomers(req: GroomerAuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const query = validateBody<{ search?: string; limit?: number; offset?: number }>(
      shopCustomerListQuerySchema,
      req.query
    );
    const result = await groomerBookingAssistService.listShopCustomers(req.groomer!, query);
    sendSuccess(res, 'Customers retrieved successfully', result);
  } catch (error) {
    next(error);
  }
}

export async function listShopCustomerPets(req: GroomerAuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = Number(req.params.userId);
    const pets = await groomerBookingAssistService.listShopCustomerPets(req.groomer!, userId);
    sendSuccess(res, 'Customer pets retrieved successfully', pets);
  } catch (error) {
    next(error);
  }
}

export async function listShopGroomers(req: GroomerAuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const groomers = await groomerBookingAssistService.listShopGroomers(req.groomer!);
    sendSuccess(res, 'Shop groomers retrieved successfully', groomers);
  } catch (error) {
    next(error);
  }
}

export async function getShopGroomerAvailability(
  req: GroomerAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const catalogGroomerId = Number(req.params.groomerId);
    const data = validateBody<Omit<AvailabilityInput, 'groomerId'>>(
      groomerShopAvailabilitySchema,
      parseAvailabilityQuery(req)
    );
    const availability = await groomerBookingAssistService.getShopGroomerAvailability(
      req.groomer!,
      catalogGroomerId,
      data
    );
    sendSuccess(res, 'Groomer availability retrieved successfully', availability);
  } catch (error) {
    next(error);
  }
}

export async function registerDeviceToken(req: GroomerAuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<{ deviceId: string; pushToken: string; platform?: string }>(
      deviceTokenSchema,
      req.body
    );
    const row = await notificationService.registerGroomerDeviceToken(req.groomer!.id, data);
    sendSuccess(res, 'Groomer device token registered successfully', row, 201);
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
