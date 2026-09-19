import { Booking, Groomer, Pet, User } from '../models';
import { getCatalogGroomers, getServices } from './catalog.service';
import { createNotification } from './notification.service';
import { sendBookingConfirmationEmail } from './email.service';
import { logger } from '../utils/logger';

async function resolveGroomerDbId(catalogGroomerId: number): Promise<number | null> {
  const catalogGroomer = getCatalogGroomers().find((item) => item.id === catalogGroomerId);
  if (!catalogGroomer) {
    return null;
  }

  const groomer = await Groomer.findOne({
    where: {
      groomerCode: catalogGroomer.code,
      isActive: true,
    },
  });

  return groomer?.id ?? null;
}

function bookingData(booking: Booking): Record<string, unknown> {
  return {
    bookingId: booking.id,
    status: booking.status,
    bookingDate: booking.bookingDate,
    startTime: booking.startTime,
    endTime: booking.endTime,
    groomerId: booking.groomerId,
    petId: booking.petId,
    serviceId: booking.serviceId,
  };
}

async function loadBookingContext(bookingId: number) {
  return Booking.findByPk(bookingId, {
    include: [
      { model: Pet, as: 'pet' },
      { model: User, as: 'user' },
    ],
  });
}

export async function notifyBookingCreated(bookingId: number): Promise<void> {
  const booking = await loadBookingContext(bookingId);
  if (!booking) {
    return;
  }

  const pet = booking.get('pet') as Pet | undefined;
  const user = booking.get('user') as User | undefined;
  const service = getServices().find((item) => item.id === booking.serviceId);
  const groomerCatalog = getCatalogGroomers().find((item) => item.id === booking.groomerId);
  const petLabel = pet?.petName || 'your pet';
  const when = `${booking.bookingDate} at ${booking.startTime}`;
  const groomerDbId = await resolveGroomerDbId(booking.groomerId);

  await createNotification({
    userId: booking.userId,
    title: 'Booking Request Received',
    message: `Your appointment for ${petLabel} on ${when} is pending groomer confirmation.`,
    type: 'booking_created',
    data: bookingData(booking),
    clientId: booking.clientId || '',
    regionId: booking.regionId || '',
    storeId: booking.storeId || '',
  });

  if (groomerDbId) {
    await createNotification({
      groomerId: groomerDbId,
      title: 'New Booking Request',
      message: `${user?.name || 'A customer'} requested ${service?.name || 'a service'} for ${petLabel} on ${when}.`,
      type: 'booking_created',
      data: bookingData(booking),
      clientId: booking.clientId || '',
      regionId: booking.regionId || '',
      storeId: booking.storeId || '',
    });
  }

  if (user?.email) {
    await sendBookingConfirmationEmail({
      to: user.email,
      recipientName: user.name,
      petName: pet?.petName || 'Your pet',
      serviceName: service?.name || 'Grooming service',
      groomerName: groomerCatalog?.name || 'Assigned groomer',
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      totalPrice: Number(booking.totalPrice),
      status: booking.status,
    });
  }
}

export async function notifyBookingCancelledByUser(booking: Booking): Promise<void> {
  const pet = booking.get('pet') as Pet | undefined;
  const user = booking.get('user') as User | undefined;
  const service = getServices().find((item) => item.id === booking.serviceId);
  const petLabel = pet?.petName || 'a pet';
  const when = `${booking.bookingDate} at ${booking.startTime}`;
  const groomerDbId = await resolveGroomerDbId(booking.groomerId);
  const isCancellationRequest = booking.status === 'cancellation_requested';

  if (!groomerDbId) {
    return;
  }

  await createNotification({
    groomerId: groomerDbId,
    title: isCancellationRequest ? 'Cancellation Requested' : 'Booking Cancelled',
    message: isCancellationRequest
      ? `${user?.name || 'A customer'} requested to cancel ${service?.name || 'a booking'} for ${petLabel} on ${when}.`
      : `${user?.name || 'A customer'} cancelled ${service?.name || 'a booking'} for ${petLabel} on ${when}.`,
    type: isCancellationRequest ? 'booking_cancellation_requested' : 'booking_cancelled',
    data: bookingData(booking),
    clientId: booking.clientId || '',
    regionId: booking.regionId || '',
    storeId: booking.storeId || '',
  });
}

export async function notifyBookingCreatedByGroomer(bookingId: number): Promise<void> {
  const booking = await loadBookingContext(bookingId);
  if (!booking) {
    return;
  }

  const pet = booking.get('pet') as Pet | undefined;
  const groomerCatalog = getCatalogGroomers().find((item) => item.id === booking.groomerId);
  const service = getServices().find((item) => item.id === booking.serviceId);
  const petLabel = pet?.petName || 'your pet';
  const when = `${booking.bookingDate} at ${booking.startTime}`;

  await createNotification({
    userId: booking.userId,
    title: 'Booking Confirmed',
    message: `${groomerCatalog?.name || 'Your groomer'} booked ${service?.name || 'a service'} for ${petLabel} on ${when}.`,
    type: 'booking_confirmed',
    data: bookingData(booking),
    clientId: booking.clientId || '',
    regionId: booking.regionId || '',
    storeId: booking.storeId || '',
  });
}

export function runBookingNotification(task: () => Promise<void>, context: string): void {
  void task().catch((error) => {
    logger.error(`Booking notification failed: ${context}`, {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  });
}
