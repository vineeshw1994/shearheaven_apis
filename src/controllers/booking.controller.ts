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

export async function cancelBooking(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const bookingId = Number(req.params.id);
    const booking = await bookingService.cancelBooking(req.user!.id, bookingId);
    sendSuccess(res, 'Booking cancelled successfully', booking);
  } catch (error) {
    next(error);
  }
}

export async function getUpcomingBookings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const bookings = await bookingService.getUpcomingBookings(req.user!.id);
    sendSuccess(res, 'Upcoming bookings retrieved successfully', bookings);
  } catch (error) {
    next(error);
  }
}

export async function getPastBookings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const bookings = await bookingService.getPastBookings(req.user!.id);
    sendSuccess(res, 'Past bookings retrieved successfully', bookings);
  } catch (error) {
    next(error);
  }
}

export async function getCancelledBookings(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const bookings = await bookingService.getCancelledBookings(req.user!.id);
    sendSuccess(res, 'Cancelled bookings retrieved successfully', bookings);
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
