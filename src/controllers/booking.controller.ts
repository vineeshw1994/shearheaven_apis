import { Request, Response, NextFunction } from 'express';
import * as bookingService from '../services/booking.service';
import { sendSuccess } from '../utils/response';
import { availabilitySchema, createBookingSchema, validateBody } from '../utils/validation';
import { AuthRequest } from '../types/express';

export async function createBooking(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<bookingService.CreateBookingInput>(createBookingSchema, req.body);
    const booking = await bookingService.createBooking(req.user!.id, data, {
      clientId: req.user!.clientId,
      regionId: req.user!.regionId,
      storeId: req.user!.storeId,
    });
    sendSuccess(res, 'Booking created successfully', booking, 201);
  } catch (error) {
    next(error);
  }
}

export async function getAvailability(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const queryAddOnIds = req.query.addOnIds;
    const body = {
      ...req.query,
      ...req.body,
      addOnIds:
        req.body?.addOnIds ||
        (typeof queryAddOnIds === 'string'
          ? queryAddOnIds.split(',').filter(Boolean).map((id: string) => Number(id))
          : queryAddOnIds),
      serviceId: req.body?.serviceId || req.query.serviceId,
      packageId: req.body?.packageId ?? req.query.packageId,
      groomerId: req.body?.groomerId ?? req.query.groomerId,
      date: req.body?.date || req.query.date,
    };

    const data = validateBody<bookingService.AvailabilityInput>(availabilitySchema, body);
    const availability = await bookingService.getAvailability(data);
    sendSuccess(res, 'Availability retrieved successfully', availability);
  } catch (error) {
    next(error);
  }
}
