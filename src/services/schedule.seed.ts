import {
  Groomer,
  Holiday,
  StoreOperationalHour,
  GroomerWorkingHour,
  GroomerUnavailability,
} from '../models';
import groomerJson from '../data/groomers.json';
import holidayJson from '../data/holidays.json';
import { DAYS_OF_WEEK, DEFAULT_TENANT } from '../utils/schedule';
import { logger } from '../utils/logger';

function parseUsDate(value: string): string {
  const [month, day, year] = value.split('/').map((part) => part.trim().padStart(2, '0'));
  return `${year}-${month}-${day}`;
}

export async function seedScheduleData(): Promise<void> {
  const existing = await Groomer.count();
  if (existing > 0) {
    return;
  }

  const tenant = DEFAULT_TENANT;

  const createdGroomers = await Groomer.bulkCreate([
    ...(groomerJson.Groomers || []).map((groomer) => ({
      groomerCode: groomer.GroomerId,
      firstName: groomer.FirstName,
      lastName: groomer.LastName,
      role: groomer.Role,
      highlights: groomer.Highlights || '',
      type: 'Groomer' as const,
      isActive: true,
      ...tenant,
    })),
    ...(groomerJson.Bathers || []).map((bather) => ({
      groomerCode: bather.BatherId,
      firstName: bather.FirstName,
      lastName: bather.LastName,
      role: bather.Role,
      highlights: bather.Highlights || '',
      type: 'Bather' as const,
      isActive: true,
      ...tenant,
    })),
  ]);

  await Holiday.bulkCreate([
    ...(holidayJson.HolidayList || []).map((holiday) => ({
      holidayCode: holiday.HolidayId,
      name: holiday.Name,
      date: parseUsDate(holiday.Date),
      description: holiday.Description || '',
      isStoreSpecific: false,
      ...tenant,
    })),
    {
      holidayCode: 'H005',
      name: 'Store Maintenance',
      date: '2026-08-21',
      description: 'Store-specific closure for equipment maintenance',
      isStoreSpecific: true,
      ...tenant,
    },
  ]);

  await StoreOperationalHour.bulkCreate(
    DAYS_OF_WEEK.map((day) => {
      const isOpen = !['Sunday', 'Monday'].includes(day);
      return {
        dayOfWeek: day,
        isOpen,
        startTime: isOpen ? '08:00' : '',
        endTime: isOpen ? '17:30' : '',
        ...tenant,
      };
    })
  );

  const workingHourRows = createdGroomers.flatMap((groomer) =>
    DAYS_OF_WEEK.map((day) => {
      const isWorking = !['Sunday', 'Monday'].includes(day);
      const isShortShift = groomer.groomerCode === 'G002';
      return {
        groomerId: groomer.id,
        dayOfWeek: day,
        isWorking,
        startTime: isWorking ? (isShortShift ? '10:00' : '08:00') : '',
        endTime: isWorking ? (isShortShift ? '15:00' : '17:30') : '',
        clientId: groomer.clientId,
        regionId: groomer.regionId,
        storeId: groomer.storeId,
      };
    })
  );
  await GroomerWorkingHour.bulkCreate(workingHourRows);

  const merisa = createdGroomers.find((groomer) => groomer.groomerCode === 'G001');
  const richard = createdGroomers.find((groomer) => groomer.groomerCode === 'G002');
  const jeremiah = createdGroomers.find((groomer) => groomer.groomerCode === 'B001');

  const unavailabilityRows = [];
  if (merisa) {
    unavailabilityRows.push({
      groomerId: merisa.id,
      startDate: '2026-08-19',
      endDate: '2026-08-19',
      startTime: '12:00',
      endTime: '13:00',
      reason: 'Lunch break',
      leaveType: 'break' as const,
      clientId: merisa.clientId,
      regionId: merisa.regionId,
      storeId: merisa.storeId,
    });
  }
  if (richard) {
    unavailabilityRows.push({
      groomerId: richard.id,
      startDate: '2026-08-20',
      endDate: '2026-08-20',
      startTime: '',
      endTime: '',
      reason: 'Personal leave',
      leaveType: 'leave' as const,
      clientId: richard.clientId,
      regionId: richard.regionId,
      storeId: richard.storeId,
    });
  }
  if (jeremiah) {
    unavailabilityRows.push({
      groomerId: jeremiah.id,
      startDate: '2026-09-01',
      endDate: '2026-09-03',
      startTime: '',
      endTime: '',
      reason: 'Vacation',
      leaveType: 'leave' as const,
      clientId: jeremiah.clientId,
      regionId: jeremiah.regionId,
      storeId: jeremiah.storeId,
    });
  }
  if (unavailabilityRows.length > 0) {
    await GroomerUnavailability.bulkCreate(unavailabilityRows);
  }

  logger.info('Schedule sample data seeded from groomers.json and holidays.json');
}
