import { Op } from 'sequelize';
import { Booking, Pet, Groomer, StoreMaster, User } from '../models';
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
  getServices,
  getPackages,
  getAddOns,
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
const SLOT_BLOCKING_STATUSES = ['pending', 'confirmed', 'cancellation_requested'];

function overlaps(startA: number, endA: number, startB: number, endB: number): boolean {
  return startA < endB && endA > startB;
}

function tenantFrom(
  input: {
    ClientId?: string;
    RegionId?: string;
    StoreId?: string;
    clientId?: string;
    regionId?: string;
    storeId?: string;
  },
  fallback: { clientId: string; regionId: string; storeId: string }
) {
  return {
    clientId: input.ClientId || input.clientId || fallback.clientId,
    regionId: input.RegionId || input.regionId || fallback.regionId,
    storeId: input.StoreId || input.storeId || fallback.storeId,
  };
}

async function getGroomerSlotSettings(groomerId: number) {
  const groomer = await Groomer.findByPk(groomerId);
  if (!groomer) {
    return { multiBookingEnabled: false, slotBookingLimit: 1 };
  }
  const limit = groomer.multiBookingEnabled ? Math.max(1, groomer.slotBookingLimit || 1) : 1;
  return {
    multiBookingEnabled: groomer.multiBookingEnabled,
    slotBookingLimit: limit,
  };
}

async function getStoreCancellationThreshold(
  clientId: string,
  regionId: string,
  storeId: string
): Promise<number> {
  const store = await StoreMaster.findOne({ where: { clientId, regionId, storeId } });
  return store?.cancellationThresholdHours ?? 3;
}

function hoursUntilBooking(bookingDate: string, startTime: string): number {
  const appointment = new Date(`${bookingDate}T${startTime}:00`);
  return (appointment.getTime() - Date.now()) / (1000 * 60 * 60);
}

async function getBookedSlots(date: string, groomerId?: number) {
  const where: Record<string, unknown> = {
    bookingDate: date,
    status: { [Op.in]: SLOT_BLOCKING_STATUSES },
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
    status: booking.status,
  }));
}

function countOverlappingSlots(
  slots: Array<{ startTime: string; endTime: string }>,
  startMinutes: number,
  endMinutes: number
): number {
  return slots.filter((slot) =>
    overlaps(startMinutes, endMinutes, timeToMinutes(slot.startTime), timeToMinutes(slot.endTime))
  ).length;
}

function isSlotAvailable(
  groomerBookings: Array<{ startTime: string; endTime: string }>,
  startMinutes: number,
  endMinutes: number,
  slotLimit: number
): boolean {
  return countOverlappingSlots(groomerBookings, startMinutes, endMinutes) < slotLimit;
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
  const groomerLimits = new Map<number, number>();
  for (const groomer of groomers) {
    const settings = await getGroomerSlotSettings(groomer.id);
    groomerLimits.set(groomer.id, settings.slotBookingLimit);
  }

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
    const slotLimit = groomerLimits.get(groomer.id) || 1;

    for (
      let start = openMinutes;
      start + quote.totalDurationMinutes <= closeMinutes;
      start += SLOT_INTERVAL_MINUTES
    ) {
      const end = start + quote.totalDurationMinutes;
      if (isSlotAvailable(groomerBookings, start, end, slotLimit)) {
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
  const slotSettings = await getGroomerSlotSettings(groomerId);

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
  const overlappingCount = countOverlappingSlots(
    bookedSlots,
    startMinutes,
    calculatedEndMinutes
  );

  if (overlappingCount >= slotSettings.slotBookingLimit) {
    throw new ConflictError('Selected time slot is fully booked for this groomer');
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
    status: 'pending',
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

function nowParts() {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  return { date, time };
}

function isBookingInPast(bookingDate: string, endTime: string): boolean {
  const { date, time } = nowParts();
  return bookingDate < date || (bookingDate === date && endTime < time);
}

export function formatBooking(booking: Booking): Record<string, unknown> {
  const pet = booking.get('pet') as Pet | undefined;
  const user = booking.get('user') as User | undefined;
  const service = getServices().find((item) => item.id === booking.serviceId);
  const pkg = booking.packageId ? getPackages().find((item) => item.id === booking.packageId) : null;
  const addOns = (booking.addOnIds || [])
    .map((id) => getAddOns().find((item) => item.id === id))
    .filter(Boolean)
    .map((item) => ({ id: item!.id, name: item!.name }));
  const groomer = getCatalogGroomers().find((item) => item.id === booking.groomerId);

  const createdAt = (booking as unknown as { createdAt?: Date }).createdAt;

  return {
    bookingId: booking.id,
    status: booking.status,
    bookingDate: booking.bookingDate,
    startTime: booking.startTime,
    endTime: booking.endTime,
    pet: pet
      ? {
          id: pet.id,
          petName: pet.petName,
          breed: pet.breed,
          profilePicture: pet.profilePicture,
        }
      : null,
    user: user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          mobile: user.mobile,
        }
      : null,
    serviceId: booking.serviceId,
    serviceName: service?.name || null,
    packageId: booking.packageId,
    packageName: pkg?.name || null,
    addOnIds: booking.addOnIds || [],
    addOns,
    groomerId: booking.groomerId,
    groomerName: groomer?.name || null,
    totalDurationMinutes: booking.totalDurationMinutes,
    totalPrice: Number(booking.totalPrice),
    clientId: booking.clientId,
    regionId: booking.regionId,
    storeId: booking.storeId,
    createdAt: createdAt || null,
  };
}

async function findUserBooking(userId: number, bookingId: number) {
  const booking = await Booking.findByPk(bookingId, {
    include: [{ model: Pet, as: 'pet' }],
  });
  if (!booking) {
    throw new NotFoundError('Booking not found');
  }
  if (booking.userId !== userId) {
    throw new ForbiddenError('You can only access your own bookings');
  }
  return booking;
}

async function listUserBookings(
  userId: number,
  where: Record<string, unknown>,
  order: Array<[string, string]>
) {
  const bookings = await Booking.findAll({
    where: { userId, ...where },
    include: [{ model: Pet, as: 'pet' }],
    order,
  });
  return bookings.map((booking) => formatBooking(booking));
}

export async function cancelBooking(userId: number, bookingId: number): Promise<Record<string, unknown>> {
  const booking = await findUserBooking(userId, bookingId);

  if (booking.status === 'cancelled') {
    throw new ConflictError('Booking is already cancelled');
  }
  if (booking.status === 'cancellation_requested') {
    throw new ConflictError('Cancellation is already pending groomer approval');
  }
  if (booking.status === 'completed') {
    throw new AppError('Completed bookings cannot be cancelled', 400);
  }
  if (isBookingInPast(booking.bookingDate, booking.endTime)) {
    throw new AppError('Past bookings cannot be cancelled', 400);
  }

  if (booking.status === 'pending') {
    await booking.update({ status: 'cancelled' });
    return formatBooking(booking);
  }

  if (booking.status === 'confirmed') {
    const thresholdHours = await getStoreCancellationThreshold(
      booking.clientId,
      booking.regionId,
      booking.storeId
    );
    const hoursLeft = hoursUntilBooking(booking.bookingDate, booking.startTime);
    if (hoursLeft < thresholdHours) {
      throw new AppError(
        `Confirmed bookings can only be cancelled at least ${thresholdHours} hour(s) before the appointment`,
        400
      );
    }
    await booking.update({ status: 'cancellation_requested' });
    return formatBooking(booking);
  }

  throw new AppError('This booking cannot be cancelled', 400);
}

export async function getUpcomingBookings(userId: number): Promise<Record<string, unknown>[]> {
  const { date, time } = nowParts();
  return listUserBookings(
    userId,
    {
      status: { [Op.in]: ['pending', 'confirmed', 'cancellation_requested'] },
      [Op.or]: [{ bookingDate: { [Op.gt]: date } }, { bookingDate: date, startTime: { [Op.gte]: time } }],
    },
    [
      ['bookingDate', 'ASC'],
      ['startTime', 'ASC'],
    ]
  );
}

export async function getPastBookings(userId: number): Promise<Record<string, unknown>[]> {
  const { date, time } = nowParts();
  return listUserBookings(
    userId,
    {
      [Op.or]: [
        { status: 'completed' },
        {
          status: { [Op.in]: ['pending', 'confirmed', 'cancellation_requested'] },
          [Op.or]: [{ bookingDate: { [Op.lt]: date } }, { bookingDate: date, endTime: { [Op.lt]: time } }],
        },
      ],
    },
    [
      ['bookingDate', 'DESC'],
      ['startTime', 'DESC'],
    ]
  );
}

export async function getCancelledBookings(userId: number): Promise<Record<string, unknown>[]> {
  return listUserBookings(userId, { status: 'cancelled' }, [
    ['bookingDate', 'DESC'],
    ['startTime', 'DESC'],
  ]);
}

export async function listGroomerBookingsForAdmin(groomerId: number): Promise<Record<string, unknown>> {
  const groomer = await Groomer.findByPk(groomerId);
  if (!groomer) {
    throw new NotFoundError('Groomer not found');
  }

  const { date, time } = nowParts();
  const bookings = await Booking.findAll({
    where: { groomerId },
    include: [
      { model: Pet, as: 'pet' },
      { model: User, as: 'user' },
    ],
    order: [
      ['bookingDate', 'DESC'],
      ['startTime', 'DESC'],
    ],
  });

  const formatted = bookings.map((booking) => formatBooking(booking));
  const pending = formatted.filter((item) => item.status === 'pending');
  const cancellationRequests = formatted.filter((item) => item.status === 'cancellation_requested');
  const upcoming = formatted.filter(
    (item) =>
      ['pending', 'confirmed', 'cancellation_requested'].includes(String(item.status)) &&
      (String(item.bookingDate) > date ||
        (String(item.bookingDate) === date && String(item.startTime) >= time))
  );
  const past = formatted.filter(
    (item) =>
      item.status === 'completed' ||
      (['pending', 'confirmed', 'cancellation_requested'].includes(String(item.status)) &&
        (String(item.bookingDate) < date ||
          (String(item.bookingDate) === date && String(item.endTime) < time)))
  );
  const cancelled = formatted.filter((item) => item.status === 'cancelled');

  return {
    groomer: {
      id: groomer.id,
      groomerCode: groomer.groomerCode,
      firstName: groomer.firstName,
      lastName: groomer.lastName,
      multiBookingEnabled: groomer.multiBookingEnabled,
      slotBookingLimit: groomer.slotBookingLimit,
    },
    pending,
    cancellationRequests,
    upcoming,
    past,
    cancelled,
  };
}
