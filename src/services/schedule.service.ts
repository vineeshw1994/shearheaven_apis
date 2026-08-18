import { Op } from 'sequelize';
import {
  Booking,
  Groomer,
  GroomerUnavailability,
  GroomerWorkingHour,
  Holiday,
  StoreOperationalHour,
} from '../models';
import { NotFoundError } from '../utils/response';
import {
  dayNameFromDate,
  minutesToTime,
  resolveTenant,
  TenantInput,
  timeToMinutes,
} from '../utils/schedule';

const SLOT_INTERVAL_MINUTES = 15;

export interface GroomerAvailabilityInput extends TenantInput {
  date: string;
  groomerId?: number | null;
  groomerIds?: number[];
  durationMinutes?: number;
}

function overlaps(startA: number, endA: number, startB: number, endB: number): boolean {
  return startA < endB && endA > startB;
}

function subtractBlocks(
  windows: Array<{ start: number; end: number }>,
  blocks: Array<{ start: number; end: number }>
): Array<{ start: number; end: number }> {
  let result = windows;

  for (const block of blocks) {
    const next: Array<{ start: number; end: number }> = [];
    for (const window of result) {
      if (!overlaps(window.start, window.end, block.start, block.end)) {
        next.push(window);
        continue;
      }
      if (window.start < block.start) {
        next.push({ start: window.start, end: Math.min(window.end, block.start) });
      }
      if (window.end > block.end) {
        next.push({ start: Math.max(window.start, block.end), end: window.end });
      }
    }
    result = next.filter((window) => window.end - window.start > 0);
  }

  return result;
}

function unavailabilityBlocksForDate(
  date: string,
  dayStart: number,
  dayEnd: number,
  rows: GroomerUnavailability[]
): Array<{ start: number; end: number; reason: string; leaveType: string }> {
  return rows
    .filter((row) => row.startDate <= date && row.endDate >= date)
    .map((row) => {
      const isStartDay = row.startDate === date;
      const isEndDay = row.endDate === date;
      const allDay = !row.startTime && !row.endTime;
      let start = dayStart;
      let end = dayEnd;

      if (!allDay && isStartDay && isEndDay) {
        start = row.startTime ? timeToMinutes(row.startTime) : dayStart;
        end = row.endTime ? timeToMinutes(row.endTime) : dayEnd;
      } else if (!allDay && isStartDay) {
        start = row.startTime ? timeToMinutes(row.startTime) : dayStart;
      } else if (!allDay && isEndDay) {
        end = row.endTime ? timeToMinutes(row.endTime) : dayEnd;
      } else if (allDay) {
        start = dayStart;
        end = dayEnd;
      }

      return {
        start,
        end,
        reason: row.reason,
        leaveType: row.leaveType,
      };
    });
}

export async function getGroomerAvailability(input: GroomerAvailabilityInput): Promise<Record<string, unknown>> {
  const tenant = resolveTenant(input);
  const durationMinutes = input.durationMinutes && input.durationMinutes > 0 ? input.durationMinutes : 15;
  const dayOfWeek = dayNameFromDate(input.date);

  const requestedIds = [
    ...(input.groomerId && input.groomerId > 0 ? [input.groomerId] : []),
    ...(input.groomerIds || []).filter((id) => id > 0),
  ].filter((id, index, list) => list.indexOf(id) === index);

  const groomerWhere: Record<string, unknown> = {
    ...tenant,
    isActive: true,
  };
  if (requestedIds.length > 0) {
    groomerWhere.id = { [Op.in]: requestedIds };
  }

  const groomers = await Groomer.findAll({
    where: groomerWhere,
    order: [['id', 'ASC']],
  });

  if (requestedIds.length > 0 && groomers.length === 0) {
    throw new NotFoundError('No matching groomers found');
  }

  const holiday = await Holiday.findOne({
    where: { ...tenant, date: input.date },
  });

  const storeHours = await StoreOperationalHour.findOne({
    where: { ...tenant, dayOfWeek },
  });

  const storeOpen = Boolean(storeHours?.isOpen) && !holiday;
  const storeStart = storeHours?.startTime ? timeToMinutes(storeHours.startTime) : 0;
  const storeEnd = storeHours?.endTime ? timeToMinutes(storeHours.endTime) : 0;

  const store = {
    ClientID: tenant.clientId,
    RegionId: tenant.regionId,
    StoreId: tenant.storeId,
    dayOfWeek,
    closed: !storeOpen,
    holiday: holiday
      ? {
          name: holiday.name,
          date: holiday.date,
          isStoreSpecific: holiday.isStoreSpecific,
          description: holiday.description,
        }
      : null,
    operationalHours: storeHours
      ? {
          isOpen: storeHours.isOpen,
          startTime: storeHours.startTime || null,
          endTime: storeHours.endTime || null,
        }
      : null,
  };

  const groomerIds = groomers.map((groomer) => groomer.id);

  const [workingHours, unavailability, bookings] = await Promise.all([
    GroomerWorkingHour.findAll({
      where: { groomerId: { [Op.in]: groomerIds.length ? groomerIds : [0] }, dayOfWeek },
    }),
    GroomerUnavailability.findAll({
      where: {
        groomerId: { [Op.in]: groomerIds.length ? groomerIds : [0] },
        startDate: { [Op.lte]: input.date },
        endDate: { [Op.gte]: input.date },
      },
    }),
    Booking.findAll({
      where: {
        bookingDate: input.date,
        status: { [Op.ne]: 'cancelled' },
        ...(groomerIds.length ? { groomerId: { [Op.in]: groomerIds } } : {}),
      },
      order: [['startTime', 'ASC']],
    }),
  ]);

  const result = groomers.map((groomer) => {
    const hours = workingHours.find((row) => row.groomerId === groomer.id);
    const groomerBlocks = unavailability.filter((row) => row.groomerId === groomer.id);
    const groomerBookings = bookings.filter((row) => row.groomerId === groomer.id);
    const bookedSlots = groomerBookings.map((booking) => ({
      bookingId: booking.id,
      startTime: booking.startTime,
      endTime: booking.endTime,
    }));

    const name = `${groomer.firstName} ${groomer.lastName}`.trim();
    const base = {
      id: groomer.id,
      groomerCode: groomer.groomerCode,
      firstName: groomer.firstName,
      lastName: groomer.lastName,
      name,
      role: groomer.role,
      type: groomer.type,
      ClientID: groomer.clientId,
      RegionId: groomer.regionId,
      StoreId: groomer.storeId,
    };

    if (!storeOpen) {
      return {
        ...base,
        available: false,
        reason: holiday ? `Store holiday: ${holiday.name}` : 'Store is closed',
        workingHours: hours
          ? { isWorking: hours.isWorking, startTime: hours.startTime, endTime: hours.endTime }
          : null,
        unavailable: [],
        bookedSlots,
        availableWindows: [],
        availableSlots: [],
      };
    }

    if (!hours || !hours.isWorking || !hours.startTime || !hours.endTime) {
      return {
        ...base,
        available: false,
        reason: 'Groomer is not scheduled on this day',
        workingHours: hours
          ? { isWorking: hours.isWorking, startTime: hours.startTime, endTime: hours.endTime }
          : null,
        unavailable: [],
        bookedSlots,
        availableWindows: [],
        availableSlots: [],
      };
    }

    const effectiveStart = Math.max(storeStart, timeToMinutes(hours.startTime));
    const effectiveEnd = Math.min(storeEnd, timeToMinutes(hours.endTime));

    if (effectiveStart >= effectiveEnd) {
      return {
        ...base,
        available: false,
        reason: 'No overlapping store and groomer working hours',
        workingHours: { isWorking: hours.isWorking, startTime: hours.startTime, endTime: hours.endTime },
        unavailable: [],
        bookedSlots,
        availableWindows: [],
        availableSlots: [],
      };
    }

    const unavailableBlocks = unavailabilityBlocksForDate(
      input.date,
      effectiveStart,
      effectiveEnd,
      groomerBlocks
    );

    const bookingBlocks = groomerBookings.map((booking) => ({
      start: timeToMinutes(booking.startTime),
      end: timeToMinutes(booking.endTime),
    }));

    const windows = subtractBlocks(
      [{ start: effectiveStart, end: effectiveEnd }],
      [...unavailableBlocks, ...bookingBlocks]
    );

    const availableSlots: Array<{ startTime: string; endTime: string }> = [];
    for (const window of windows) {
      for (let start = window.start; start + durationMinutes <= window.end; start += SLOT_INTERVAL_MINUTES) {
        availableSlots.push({
          startTime: minutesToTime(start),
          endTime: minutesToTime(start + durationMinutes),
        });
      }
    }

    const fullDayUnavailable =
      unavailableBlocks.some((block) => block.start <= effectiveStart && block.end >= effectiveEnd);

    return {
      ...base,
      available: availableSlots.length > 0,
      reason: fullDayUnavailable
        ? unavailableBlocks[0]?.reason || 'Groomer is unavailable'
        : availableSlots.length === 0
          ? 'No open slots remaining'
          : null,
      workingHours: {
        isWorking: hours.isWorking,
        startTime: hours.startTime,
        endTime: hours.endTime,
        effectiveStartTime: minutesToTime(effectiveStart),
        effectiveEndTime: minutesToTime(effectiveEnd),
      },
      unavailable: unavailableBlocks.map((block) => ({
        startTime: minutesToTime(block.start),
        endTime: minutesToTime(block.end),
        reason: block.reason,
        leaveType: block.leaveType,
      })),
      bookedSlots,
      availableWindows: windows.map((window) => ({
        startTime: minutesToTime(window.start),
        endTime: minutesToTime(window.end),
      })),
      availableSlots,
    };
  });

  return {
    date: input.date,
    durationMinutes,
    scope: requestedIds.length === 1 ? 'single' : requestedIds.length > 1 ? 'selected' : 'all',
    store,
    groomers: result,
  };
}
