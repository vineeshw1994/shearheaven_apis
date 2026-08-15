import { Op } from 'sequelize';
import { Booking, Pet } from '../models';
import {
  AppError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from '../utils/response';
import {
  calculateQuote,
  getCatalogGroomers,
  getDefaultGroomer,
  getGroomerById,
  getHolidayOnDate,
  getWorkingHoursForDate,
  minutesToTime,
  timeToMinutes,
} from './catalog.service';

export interface CreateBookingInput {
  petId: number;
  serviceId: number;
  packageId?: number | null;
  addOnIds?: number[];
  groomerId: number;
  bookingDate: string;
  startTime: string;
  endTime: string;
  ClientId?: string;
  RegionId?: string;
  StoreId?: string;
  clientId?: string;
  regionId?: string;
  storeId?: string;
}

export interface AvailabilityInput {
  date: string;
  serviceId: number;
  packageId?: number | null;
  addOnIds?: number[];
  groomerId?: number | null;
  ClientId?: string;
  RegionId?: string;
  StoreId?: string;
  clientId?: string;
  regionId?: string;
  storeId?: string;
}

const SLOT_INTERVAL_MINUTES = 15;

function overlaps(startA: number, endA: number, startB: number, endB: number): boolean {
  return startA < endB && endA > startB;
}

function tenantFrom(input: {
  ClientId?: string;
  RegionId?: string;
  StoreId?: string;
  clientId?: string;
  regionId?: string;
  storeId?: string;
}, fallback: { clientId: string; regionId: string; storeId: string }) {
  return {
    clientId: input.ClientId || input.clientId || fallback.clientId,
    regionId: input.RegionId || input.regionId || fallback.regionId,
    storeId: input.StoreId || input.storeId || fallback.storeId,
  };
}

async function getBookedSlots(date: string, groomerId?: number) {
  const where: Record<string, unknown> = {
    bookingDate: date,
    status: { [Op.ne]: 'cancelled' },
  };

  if (groomerId) {
    where.groomerId = groomerId;
  }

  const bookings = await Booking.findAll({
    where,
    order: [['startTime', 'ASC']],
  });

  return bookings.map((booking) => ({
    bookingId: booking.id,
    groomerId: booking.groomerId,
    startTime: booking.startTime,
    endTime: booking.endTime,
  }));
}

function assertStoreIsOpen(date: string) {
  const holiday = getHolidayOnDate(date);
  if (holiday) {
    throw new AppError(`Store is closed on ${holiday.Name}`, 400);
  }

  const workingHours = getWorkingHoursForDate(date);
  if (workingHours.closed) {
    throw new AppError('Store is closed on the selected date', 400);
  }

  return workingHours;
}

function resolveGroomerId(groomerId: number): number {
  if (!groomerId) {
    return getDefaultGroomer().id;
  }
  return getGroomerById(groomerId).id;
}

export async function getAvailability(input: AvailabilityInput): Promise<Record<string, unknown>> {
  const quote = calculateQuote(input.serviceId, input.packageId, input.addOnIds || []);
  const holiday = getHolidayOnDate(input.date);
  const workingHours = getWorkingHoursForDate(input.date);
  const requestedGroomerId = input.groomerId && input.groomerId > 0 ? input.groomerId : null;

  if (requestedGroomerId) {
    getGroomerById(requestedGroomerId);
  }

  const groomers = requestedGroomerId
    ? getCatalogGroomers().filter((groomer) => groomer.id === requestedGroomerId)
    : getCatalogGroomers();

  const bookedSlots = await getBookedSlots(input.date, requestedGroomerId || undefined);

  if (holiday || workingHours.closed) {
    return {
      date: input.date,
      closed: true,
      holiday: holiday ? { name: holiday.Name, date: holiday.Date } : null,
      totalDurationMinutes: quote.totalDurationMinutes,
      totalPrice: quote.totalPrice,
      workingHours,
      bookedSlots,
      availableSlots: [],
      groomers: groomers.map((groomer) => ({
        id: groomer.id,
        name: groomer.name,
        role: groomer.role,
        workingHours,
        available: false,
      })),
    };
  }

  const openMinutes = timeToMinutes(workingHours.open);
  const closeMinutes = timeToMinutes(workingHours.close);
  const availableSlots: Array<{
    startTime: string;
    endTime: string;
    groomerId: number;
    groomerName: string;
  }> = [];

  for (const groomer of groomers) {
    const groomerBookings = bookedSlots.filter((slot) => slot.groomerId === groomer.id);

    for (
      let start = openMinutes;
      start + quote.totalDurationMinutes <= closeMinutes;
      start += SLOT_INTERVAL_MINUTES
    ) {
      const end = start + quote.totalDurationMinutes;
      const hasConflict = groomerBookings.some((slot) =>
        overlaps(start, end, timeToMinutes(slot.startTime), timeToMinutes(slot.endTime))
      );

      if (!hasConflict) {
        availableSlots.push({
          startTime: minutesToTime(start),
          endTime: minutesToTime(end),
          groomerId: groomer.id,
          groomerName: groomer.name,
        });
      }
    }
  }

  return {
    date: input.date,
    closed: false,
    holiday: null,
    totalDurationMinutes: quote.totalDurationMinutes,
    totalPrice: quote.totalPrice,
    workingHours,
    bookedSlots,
    availableSlots,
    groomers: groomers.map((groomer) => ({
      id: groomer.id,
      name: groomer.name,
      role: groomer.role,
      workingHours,
      available: availableSlots.some((slot) => slot.groomerId === groomer.id),
    })),
  };
}

export async function createBooking(
  userId: number,
  input: CreateBookingInput,
  userTenant: { clientId: string; regionId: string; storeId: string }
): Promise<{
  bookingId: number;
  status: string;
  totalDurationMinutes: number;
  totalPrice: number;
}> {
  const pet = await Pet.findByPk(input.petId);
  if (!pet) {
    throw new NotFoundError('Pet not found');
  }
  if (pet.userId !== userId) {
    throw new ForbiddenError('You can only book appointments for your own pets');
  }

  const workingHours = assertStoreIsOpen(input.bookingDate);
  const quote = calculateQuote(input.serviceId, input.packageId, input.addOnIds || []);
  const groomerId = resolveGroomerId(input.groomerId);

  const startMinutes = timeToMinutes(input.startTime);
  const providedEndMinutes = timeToMinutes(input.endTime);
  const calculatedEndMinutes = startMinutes + quote.totalDurationMinutes;
  const endTime = minutesToTime(calculatedEndMinutes);

  if (providedEndMinutes !== calculatedEndMinutes) {
    throw new AppError(
      `endTime must be ${endTime} based on the selected service duration of ${quote.totalDurationMinutes} minutes`,
      400
    );
  }

  const openMinutes = timeToMinutes(workingHours.open);
  const closeMinutes = timeToMinutes(workingHours.close);

  if (startMinutes < openMinutes || calculatedEndMinutes > closeMinutes) {
    throw new AppError(
      `Selected time is outside groomer working hours (${workingHours.open} - ${workingHours.close})`,
      400
    );
  }

  const bookedSlots = await getBookedSlots(input.bookingDate, groomerId);
  const hasConflict = bookedSlots.some((slot) =>
    overlaps(
      startMinutes,
      calculatedEndMinutes,
      timeToMinutes(slot.startTime),
      timeToMinutes(slot.endTime)
    )
  );

  if (hasConflict) {
    throw new ConflictError('Selected time slot is already booked for this groomer');
  }

  const tenant = tenantFrom(input, userTenant);

  const booking = await Booking.create({
    userId,
    petId: input.petId,
    serviceId: input.serviceId,
    packageId: input.packageId || null,
    addOnIds: input.addOnIds || [],
    groomerId,
    bookingDate: input.bookingDate,
    startTime: input.startTime,
    endTime,
    status: 'confirmed',
    totalDurationMinutes: quote.totalDurationMinutes,
    totalPrice: quote.totalPrice,
    clientId: tenant.clientId,
    regionId: tenant.regionId,
    storeId: tenant.storeId,
  });

  return {
    bookingId: booking.id,
    status: booking.status,
    totalDurationMinutes: booking.totalDurationMinutes,
    totalPrice: Number(booking.totalPrice),
  };
}
