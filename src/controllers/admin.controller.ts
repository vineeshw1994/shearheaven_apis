import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service';
import * as bookingService from '../services/booking.service';
import * as groomerAuthService from '../services/groomer-auth.service';
import * as discountService from '../services/discount.service';
import * as offerService from '../services/offer.service';
import * as contentService from '../services/content.service';
import { NotFoundError, sendSuccess } from '../utils/response';
import { validateBody } from '../utils/validation';
import {
  groomerCreateSchema,
  groomerUpdateSchema,
  holidayCreateSchema,
  holidayUpdateSchema,
  storeHourCreateSchema,
  storeHourUpdateSchema,
  groomerHourCreateSchema,
  groomerHourUpdateSchema,
  unavailabilityCreateSchema,
  unavailabilityUpdateSchema,
  clientCreateSchema,
  clientUpdateSchema,
  regionCreateSchema,
  regionUpdateSchema,
  storeMasterCreateSchema,
  storeMasterUpdateSchema,
} from '../utils/schedule.validation';

function idParam(req: Request): number {
  return Number(req.params.id);
}

export async function listClients(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rows = await adminService.listClients();
    sendSuccess(res, 'Clients retrieved successfully', rows);
  } catch (error) {
    next(error);
  }
}

export async function createClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<Record<string, unknown>>(clientCreateSchema, req.body);
    const row = await adminService.createClient(data);
    sendSuccess(res, 'Client created successfully', row, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<Record<string, unknown>>(clientUpdateSchema, req.body);
    const row = await adminService.updateClient(idParam(req), data);
    sendSuccess(res, 'Client updated successfully', row);
  } catch (error) {
    next(error);
  }
}

export async function deleteClient(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await adminService.deleteClient(idParam(req));
    sendSuccess(res, 'Client deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function listRegions(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rows = await adminService.listRegions(req.query);
    sendSuccess(res, 'Regions retrieved successfully', rows);
  } catch (error) {
    next(error);
  }
}

export async function createRegion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<Parameters<typeof adminService.createRegion>[0]>(regionCreateSchema, req.body);
    const row = await adminService.createRegion(data);
    sendSuccess(res, 'Region created successfully', row, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateRegion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<Record<string, unknown>>(regionUpdateSchema, req.body);
    const row = await adminService.updateRegion(idParam(req), data);
    sendSuccess(res, 'Region updated successfully', row);
  } catch (error) {
    next(error);
  }
}

export async function deleteRegion(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await adminService.deleteRegion(idParam(req));
    sendSuccess(res, 'Region deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function listStores(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rows = await adminService.listStores(req.query);
    sendSuccess(res, 'Stores retrieved successfully', rows);
  } catch (error) {
    next(error);
  }
}

export async function createStore(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<Parameters<typeof adminService.createStore>[0]>(storeMasterCreateSchema, req.body);
    const row = await adminService.createStore(data);
    sendSuccess(res, 'Store created successfully', row, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateStore(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<Record<string, unknown>>(storeMasterUpdateSchema, req.body);
    const row = await adminService.updateStore(idParam(req), data);
    sendSuccess(res, 'Store updated successfully', row);
  } catch (error) {
    next(error);
  }
}

export async function deleteStore(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await adminService.deleteStore(idParam(req));
    sendSuccess(res, 'Store deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function listGroomers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rows = await adminService.listGroomers(req.query);
    sendSuccess(res, 'Groomers retrieved successfully', rows);
  } catch (error) {
    next(error);
  }
}

export async function createGroomer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<Parameters<typeof adminService.createGroomer>[0]>(groomerCreateSchema, req.body);
    const row = await adminService.createGroomer(data);
    sendSuccess(res, 'Groomer created successfully', row, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateGroomer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<Record<string, unknown>>(groomerUpdateSchema, req.body);
    const row = await adminService.updateGroomer(idParam(req), data);
    sendSuccess(res, 'Groomer updated successfully', row);
  } catch (error) {
    next(error);
  }
}

export async function deleteGroomer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await adminService.deleteGroomer(idParam(req));
    sendSuccess(res, 'Groomer deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function listHolidays(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rows = await adminService.listHolidays(req.query);
    sendSuccess(res, 'Holidays retrieved successfully', rows);
  } catch (error) {
    next(error);
  }
}

export async function createHoliday(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<Parameters<typeof adminService.createHoliday>[0]>(holidayCreateSchema, req.body);
    const row = await adminService.createHoliday(data);
    sendSuccess(res, 'Holiday created successfully', row, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateHoliday(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<Record<string, unknown>>(holidayUpdateSchema, req.body);
    const row = await adminService.updateHoliday(idParam(req), data);
    sendSuccess(res, 'Holiday updated successfully', row);
  } catch (error) {
    next(error);
  }
}

export async function deleteHoliday(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await adminService.deleteHoliday(idParam(req));
    sendSuccess(res, 'Holiday deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function listStoreHours(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rows = await adminService.listStoreHours(req.query);
    sendSuccess(res, 'Store operational hours retrieved successfully', rows);
  } catch (error) {
    next(error);
  }
}

export async function createStoreHour(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<Parameters<typeof adminService.createStoreHour>[0]>(storeHourCreateSchema, req.body);
    const row = await adminService.createStoreHour(data);
    sendSuccess(res, 'Store operational hour created successfully', row, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateStoreHour(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<Record<string, unknown>>(storeHourUpdateSchema, req.body);
    const row = await adminService.updateStoreHour(idParam(req), data);
    sendSuccess(res, 'Store operational hour updated successfully', row);
  } catch (error) {
    next(error);
  }
}

export async function deleteStoreHour(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await adminService.deleteStoreHour(idParam(req));
    sendSuccess(res, 'Store operational hour deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function listGroomerHours(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rows = await adminService.listGroomerHours({
      ...req.query,
      groomerCode: req.query.groomerCode ? String(req.query.groomerCode) : undefined,
    });
    sendSuccess(res, 'Groomer working hours retrieved successfully', rows);
  } catch (error) {
    next(error);
  }
}

export async function createGroomerHour(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<Parameters<typeof adminService.createGroomerHour>[0]>(groomerHourCreateSchema, req.body);
    const row = await adminService.createGroomerHour(data);
    sendSuccess(res, 'Groomer working hour created successfully', row, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateGroomerHour(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<Record<string, unknown>>(groomerHourUpdateSchema, req.body);
    const row = await adminService.updateGroomerHour(idParam(req), data);
    sendSuccess(res, 'Groomer working hour updated successfully', row);
  } catch (error) {
    next(error);
  }
}

export async function deleteGroomerHour(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await adminService.deleteGroomerHour(idParam(req));
    sendSuccess(res, 'Groomer working hour deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function listUnavailability(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rows = await adminService.listUnavailability({
      ...req.query,
      groomerCode: req.query.groomerCode ? String(req.query.groomerCode) : undefined,
    });
    sendSuccess(res, 'Groomer unavailability retrieved successfully', rows);
  } catch (error) {
    next(error);
  }
}

export async function createUnavailability(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<Parameters<typeof adminService.createUnavailability>[0]>(
      unavailabilityCreateSchema,
      req.body
    );
    const row = await adminService.createUnavailability(data);
    sendSuccess(res, 'Groomer unavailability created successfully', row, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateUnavailability(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<Record<string, unknown>>(unavailabilityUpdateSchema, req.body);
    const row = await adminService.updateUnavailability(idParam(req), data);
    sendSuccess(res, 'Groomer unavailability updated successfully', row);
  } catch (error) {
    next(error);
  }
}

export async function deleteUnavailability(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await adminService.deleteUnavailability(idParam(req));
    sendSuccess(res, 'Groomer unavailability deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function getGroomerBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = await bookingService.listGroomerBookingsForAdmin(Number(req.params.groomerId));
    sendSuccess(res, 'Groomer bookings retrieved successfully', data);
  } catch (error) {
    next(error);
  }
}

export async function approveGroomerBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const bookingId = Number(req.params.bookingId);
    const { Booking } = await import('../models');
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }
    const result = await groomerAuthService.approveBooking(booking.groomerId, bookingId);
    sendSuccess(res, 'Booking approved successfully', result);
  } catch (error) {
    next(error);
  }
}

export async function rejectGroomerBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const bookingId = Number(req.params.bookingId);
    const { Booking } = await import('../models');
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      throw new NotFoundError('Booking not found');
    }
    const result = await groomerAuthService.rejectBooking(booking.groomerId, bookingId);
    sendSuccess(res, 'Booking rejected successfully', result);
  } catch (error) {
    next(error);
  }
}

export async function listDiscountsAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rows = await discountService.listAllDiscounts(req.query);
    sendSuccess(res, 'Discounts retrieved successfully', rows);
  } catch (error) {
    next(error);
  }
}

export async function createDiscount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await discountService.createDiscount(req.body);
    sendSuccess(res, 'Discount created successfully', row, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateDiscount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await discountService.updateDiscount(idParam(req), req.body);
    sendSuccess(res, 'Discount updated successfully', row);
  } catch (error) {
    next(error);
  }
}

export async function deleteDiscount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await discountService.deleteDiscount(idParam(req));
    sendSuccess(res, 'Discount deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function listOffersAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rows = await offerService.listAllOffers(req.query);
    sendSuccess(res, 'Offers retrieved successfully', rows);
  } catch (error) {
    next(error);
  }
}

export async function createOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await offerService.createOffer(req.body);
    sendSuccess(res, 'Offer created successfully', row, 201);
  } catch (error) {
    next(error);
  }
}

export async function updateOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await offerService.updateOffer(idParam(req), req.body);
    sendSuccess(res, 'Offer updated successfully', row);
  } catch (error) {
    next(error);
  }
}

export async function deleteOffer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await offerService.deleteOffer(idParam(req));
    sendSuccess(res, 'Offer deleted successfully');
  } catch (error) {
    next(error);
  }
}

export async function listStoreContentAdmin(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rows = await contentService.listStoreContent(req.query as Record<string, string>);
    sendSuccess(res, 'Store content retrieved successfully', rows);
  } catch (error) {
    next(error);
  }
}

export async function upsertStoreContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await contentService.upsertStoreContent(req.body);
    sendSuccess(res, 'Store content saved successfully', row, 201);
  } catch (error) {
    next(error);
  }
}

export async function deleteStoreContent(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await contentService.deleteStoreContent(idParam(req));
    sendSuccess(res, 'Store content deleted successfully');
  } catch (error) {
    next(error);
  }
}
