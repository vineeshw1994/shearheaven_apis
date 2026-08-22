import { Op } from 'sequelize';
import { Groomer, Booking, Pet, User, GroomerRefreshToken } from '../models';
import { comparePassword, hashPassword, hashToken, compareToken } from '../utils/crypto';
import {
  generateGroomerAccessToken,
  generateGroomerRefreshToken,
  getRefreshTokenExpiryDate,
  verifyGroomerRefreshToken,
} from '../utils/jwt';
import {
  AppError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from '../utils/response';
import { formatBooking } from './booking.service';

export interface GroomerLoginInput {
  email: string;
  password: string;
}

export interface GroomerProfileUpdateInput {
  firstName?: string;
  lastName?: string;
  mobile?: string;
  password?: string;
  multiBookingEnabled?: boolean;
  slotBookingLimit?: number;
}

function sanitizeGroomer(groomer: Groomer): Record<string, unknown> {
  return {
    id: groomer.id,
    groomerCode: groomer.groomerCode,
    firstName: groomer.firstName,
    lastName: groomer.lastName,
    email: groomer.email,
    mobile: groomer.mobile,
    role: groomer.role,
    highlights: groomer.highlights,
    type: groomer.type,
    isActive: groomer.isActive,
    multiBookingEnabled: groomer.multiBookingEnabled,
    slotBookingLimit: groomer.slotBookingLimit,
    mustChangePassword: groomer.mustChangePassword,
    clientId: groomer.clientId,
    regionId: groomer.regionId,
    storeId: groomer.storeId,
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

async function findGroomerBooking(groomerId: number, bookingId: number) {
  const booking = await Booking.findByPk(bookingId, {
    include: [
      { model: Pet, as: 'pet' },
      { model: User, as: 'user' },
    ],
  });
  if (!booking) {
    throw new NotFoundError('Booking not found');
  }
  if (booking.groomerId !== groomerId) {
    throw new ForbiddenError('You can only manage your own bookings');
  }
  return booking;
}

async function listGroomerBookings(
  groomerId: number,
  where: Record<string, unknown>,
  order: Array<[string, string]>
) {
  const bookings = await Booking.findAll({
    where: { groomerId, ...where },
    include: [
      { model: Pet, as: 'pet' },
      { model: User, as: 'user' },
    ],
    order,
  });
  return bookings.map((booking) => formatBooking(booking));
}

export interface GroomerSetupAccountInput {
  tempLoginId: string;
  tempPassword: string;
  email: string;
  password: string;
}

async function generateGroomerAuthTokens(groomer: Groomer): Promise<Record<string, unknown>> {
  const refreshRecord = await GroomerRefreshToken.create({
    groomerId: groomer.id,
    tokenHash: '',
    expiresAt: getRefreshTokenExpiryDate(),
  });
  const refreshToken = generateGroomerRefreshToken({
    groomerId: groomer.id,
    tokenId: refreshRecord.id,
  });
  await refreshRecord.update({ tokenHash: await hashToken(refreshToken) });
  const accessToken = generateGroomerAccessToken({
    groomerId: groomer.id,
    email: groomer.email,
    role: 'groomer',
  });
  return { accessToken, refreshToken };
}

export async function loginGroomer(input: GroomerLoginInput): Promise<Record<string, unknown>> {
  const loginId = input.email.trim().toLowerCase();
  const groomer = await Groomer.findOne({
    where: {
      [Op.or]: [{ email: loginId }, { tempLoginId: loginId }],
      isActive: true,
    },
  });

  if (!groomer || !groomer.password) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const valid = await comparePassword(input.password, groomer.password);
  if (!valid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (groomer.mustChangePassword) {
    return {
      mustChangePassword: true,
      tempLoginId: groomer.tempLoginId || groomer.email,
      groomer: sanitizeGroomer(groomer),
    };
  }

  const tokens = await generateGroomerAuthTokens(groomer);
  return {
    ...tokens,
    mustChangePassword: false,
    groomer: sanitizeGroomer(groomer),
  };
}

export async function setupGroomerAccount(input: GroomerSetupAccountInput): Promise<Record<string, unknown>> {
  const tempLoginId = input.tempLoginId.trim().toLowerCase();
  const groomer = await Groomer.findOne({
    where: { tempLoginId, mustChangePassword: true, isActive: true },
  });
  if (!groomer) {
    throw new NotFoundError('Groomer setup record not found');
  }

  const validTemp = await comparePassword(input.tempPassword, groomer.password);
  if (!validTemp) {
    throw new UnauthorizedError('Invalid temporary password');
  }

  await ensureGroomerEmailAvailable(input.email.trim().toLowerCase(), groomer.id);
  const hashedPassword = await hashPassword(input.password);
  await groomer.update({
    email: input.email.trim().toLowerCase(),
    password: hashedPassword,
    mustChangePassword: false,
    tempLoginId: '',
  });

  const tokens = await generateGroomerAuthTokens(groomer);
  return {
    ...tokens,
    mustChangePassword: false,
    groomer: sanitizeGroomer(groomer),
  };
}

export async function refreshGroomerAccessToken(refreshToken: string): Promise<Record<string, unknown>> {
  let payload;
  try {
    payload = verifyGroomerRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const tokenRecord = await GroomerRefreshToken.findByPk(payload.tokenId);
  if (!tokenRecord || tokenRecord.revoked || tokenRecord.expiresAt < new Date()) {
    throw new UnauthorizedError('Refresh token has been revoked or expired');
  }

  const isValid = await compareToken(refreshToken, tokenRecord.tokenHash);
  if (!isValid) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const groomer = await Groomer.findByPk(payload.groomerId);
  if (!groomer || !groomer.isActive) {
    throw new UnauthorizedError('Groomer not found');
  }

  const accessToken = generateGroomerAccessToken({
    groomerId: groomer.id,
    email: groomer.email,
    role: 'groomer',
  });
  return { accessToken };
}

export async function getGroomerProfile(groomerId: number): Promise<Record<string, unknown>> {
  const groomer = await Groomer.findByPk(groomerId);
  if (!groomer) {
    throw new NotFoundError('Groomer not found');
  }
  return sanitizeGroomer(groomer);
}

export async function updateGroomerProfile(
  groomerId: number,
  input: GroomerProfileUpdateInput
): Promise<Record<string, unknown>> {
  const groomer = await Groomer.findByPk(groomerId);
  if (!groomer) {
    throw new NotFoundError('Groomer not found');
  }

  const updates: Record<string, unknown> = {};
  if (input.firstName !== undefined) updates.firstName = input.firstName;
  if (input.lastName !== undefined) updates.lastName = input.lastName;
  if (input.mobile !== undefined) updates.mobile = input.mobile;
  if (input.multiBookingEnabled !== undefined) updates.multiBookingEnabled = input.multiBookingEnabled;
  if (input.slotBookingLimit !== undefined) {
    updates.slotBookingLimit = Math.max(1, input.slotBookingLimit);
  }
  if (input.password) {
    updates.password = await hashPassword(input.password);
  }

  if (input.multiBookingEnabled === false) {
    updates.slotBookingLimit = 1;
  }

  await groomer.update(updates);
  return sanitizeGroomer(groomer);
}

export async function getGroomerPendingBookings(groomerId: number): Promise<Record<string, unknown>[]> {
  return listGroomerBookings(groomerId, { status: 'pending' }, [
    ['bookingDate', 'ASC'],
    ['startTime', 'ASC'],
  ]);
}

export async function getGroomerUpcomingBookings(groomerId: number): Promise<Record<string, unknown>[]> {
  const { date, time } = nowParts();
  return listGroomerBookings(
    groomerId,
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

export async function getGroomerPastBookings(groomerId: number): Promise<Record<string, unknown>[]> {
  const { date, time } = nowParts();
  return listGroomerBookings(
    groomerId,
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

export async function getGroomerCancelledBookings(groomerId: number): Promise<Record<string, unknown>[]> {
  return listGroomerBookings(groomerId, { status: 'cancelled' }, [
    ['bookingDate', 'DESC'],
    ['startTime', 'DESC'],
  ]);
}

export async function getGroomerCancellationRequests(groomerId: number): Promise<Record<string, unknown>[]> {
  return listGroomerBookings(groomerId, { status: 'cancellation_requested' }, [
    ['bookingDate', 'ASC'],
    ['startTime', 'ASC'],
  ]);
}

export async function approveBooking(groomerId: number, bookingId: number): Promise<Record<string, unknown>> {
  const booking = await findGroomerBooking(groomerId, bookingId);
  if (booking.status !== 'pending') {
    throw new AppError('Only pending bookings can be approved', 400);
  }
  await booking.update({ status: 'confirmed' });
  return formatBooking(booking);
}

export async function rejectBooking(groomerId: number, bookingId: number): Promise<Record<string, unknown>> {
  const booking = await findGroomerBooking(groomerId, bookingId);
  if (booking.status !== 'pending') {
    throw new AppError('Only pending bookings can be rejected', 400);
  }
  await booking.update({ status: 'cancelled' });
  return formatBooking(booking);
}

export async function completeBooking(groomerId: number, bookingId: number): Promise<Record<string, unknown>> {
  const booking = await findGroomerBooking(groomerId, bookingId);
  if (!['pending', 'confirmed'].includes(booking.status)) {
    throw new AppError('Only pending or confirmed bookings can be completed', 400);
  }

  const { date, time } = nowParts();
  if (
    String(booking.bookingDate) > date ||
    (String(booking.bookingDate) === date && String(booking.endTime) > time)
  ) {
    throw new AppError('Booking can only be completed after the appointment end time', 400);
  }

  await booking.update({ status: 'completed' });
  return formatBooking(booking);
}

export async function approveCancellation(groomerId: number, bookingId: number): Promise<Record<string, unknown>> {
  const booking = await findGroomerBooking(groomerId, bookingId);
  if (booking.status !== 'cancellation_requested') {
    throw new AppError('No cancellation request found for this booking', 400);
  }
  await booking.update({ status: 'cancelled' });
  return formatBooking(booking);
}

export async function rejectCancellation(groomerId: number, bookingId: number): Promise<Record<string, unknown>> {
  const booking = await findGroomerBooking(groomerId, bookingId);
  if (booking.status !== 'cancellation_requested') {
    throw new AppError('No cancellation request found for this booking', 400);
  }
  await booking.update({ status: 'confirmed' });
  return formatBooking(booking);
}

export function sanitizeGroomerForAdmin(groomer: Groomer) {
  const data = groomer.toJSON() as Record<string, unknown>;
  delete data.password;
  return data;
}

export async function hashGroomerPasswordIfProvided(password?: string) {
  if (!password) {
    return undefined;
  }
  return hashPassword(password);
}

export async function ensureGroomerEmailAvailable(email: string, excludeId?: number) {
  if (!email) return;
  const existing = await Groomer.findOne({
    where: {
      email: email.trim().toLowerCase(),
      ...(excludeId ? { id: { [Op.ne]: excludeId } } : {}),
    },
  });
  if (existing) {
    throw new ConflictError('Email is already registered for another groomer');
  }
}
