import { QueryTypes } from 'sequelize';
import { sequelize } from '../config/database';
import {
  ClientMaster,
  RegionMaster,
  StoreMaster,
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

async function hasColumn(table: string, column: string): Promise<boolean> {
  const rows = await sequelize.query<{ Field: string }>(
    `SHOW COLUMNS FROM \`${table}\` LIKE :column`,
    { replacements: { column }, type: QueryTypes.SELECT }
  );
  return rows.length > 0;
}

async function tableExists(table: string): Promise<boolean> {
  const rows = await sequelize.query<{ name: string }>(
    `SELECT TABLE_NAME AS name FROM information_schema.TABLES
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = :table`,
    { replacements: { table }, type: QueryTypes.SELECT }
  );
  return rows.length > 0;
}

async function dropColumnWithIndexes(table: string, column: string): Promise<void> {
  if (!(await hasColumn(table, column))) {
    return;
  }

  const fks = await sequelize.query<{ CONSTRAINT_NAME: string }>(
    `SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = :table
       AND COLUMN_NAME = :column
       AND REFERENCED_TABLE_NAME IS NOT NULL`,
    { replacements: { table, column }, type: QueryTypes.SELECT }
  );

  for (const fk of fks) {
    await sequelize.query(`ALTER TABLE \`${table}\` DROP FOREIGN KEY \`${fk.CONSTRAINT_NAME}\``);
  }

  const indexes = await sequelize.query<{ Key_name: string; Column_name: string }>(
    `SHOW INDEX FROM \`${table}\``,
    { type: QueryTypes.SELECT }
  );
  const toDrop = [
    ...new Set(
      indexes
        .filter((row) => row.Column_name === column && row.Key_name !== 'PRIMARY')
        .map((row) => row.Key_name)
    ),
  ];
  for (const name of toDrop) {
    await sequelize.query(`ALTER TABLE \`${table}\` DROP INDEX \`${name}\``);
  }

  await sequelize.query(`ALTER TABLE \`${table}\` DROP COLUMN \`${column}\``);
}

async function migrateTableToGroomerCode(table: string): Promise<void> {
  if (!(await tableExists(table))) {
    return;
  }

  const hasCode = await hasColumn(table, 'groomerCode');
  const hasId = await hasColumn(table, 'groomerId');

  if (!hasCode && hasId) {
    await sequelize.query(`ALTER TABLE \`${table}\` ADD COLUMN \`groomerCode\` VARCHAR(50) NULL`);
    await sequelize.query(
      `UPDATE \`${table}\` t
       INNER JOIN \`groomers\` g ON g.id = t.groomerId
       SET t.groomerCode = g.groomerCode`
    );
    await sequelize.query(`UPDATE \`${table}\` SET \`groomerCode\` = '' WHERE \`groomerCode\` IS NULL`);
    await sequelize.query(`ALTER TABLE \`${table}\` MODIFY \`groomerCode\` VARCHAR(50) NOT NULL`);
  }

  if (hasId) {
    await dropColumnWithIndexes(table, 'groomerId');
  }
}

export async function alignScheduleSchema(): Promise<void> {
  await migrateTableToGroomerCode('groomer_working_hours');
  await migrateTableToGroomerCode('groomer_unavailability');
  await alignBookingFlowSchema();
}

async function addColumnIfMissing(
  table: string,
  column: string,
  definition: string
): Promise<void> {
  if (!(await tableExists(table))) {
    return;
  }
  if (!(await hasColumn(table, column))) {
    await sequelize.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${definition}`);
  }
}

async function alignBookingFlowSchema(): Promise<void> {
  await addColumnIfMissing('groomers', 'email', 'VARCHAR(255) NOT NULL DEFAULT ""');
  await addColumnIfMissing('groomers', 'password', 'VARCHAR(255) NOT NULL DEFAULT ""');
  await addColumnIfMissing('groomers', 'mobile', 'VARCHAR(20) NOT NULL DEFAULT ""');
  await addColumnIfMissing('groomers', 'multiBookingEnabled', 'TINYINT(1) NOT NULL DEFAULT 0');
  await addColumnIfMissing('groomers', 'slotBookingLimit', 'INT UNSIGNED NOT NULL DEFAULT 1');
  await addColumnIfMissing('groomers', 'mustChangePassword', 'TINYINT(1) NOT NULL DEFAULT 0');
  await addColumnIfMissing('groomers', 'tempLoginId', 'VARCHAR(255) NOT NULL DEFAULT ""');
  await addColumnIfMissing(
    'store_master',
    'cancellationThresholdHours',
    'INT UNSIGNED NOT NULL DEFAULT 3'
  );
  await addColumnIfMissing('pending_signups', 'deviceId', 'VARCHAR(100) NOT NULL DEFAULT ""');

  if (await tableExists('bookings')) {
    await sequelize.query(`
      ALTER TABLE \`bookings\`
      MODIFY COLUMN \`status\` ENUM(
        'pending',
        'confirmed',
        'cancelled',
        'completed',
        'cancellation_requested'
      ) NOT NULL DEFAULT 'pending'
    `);
  }

  await seedGroomerCredentials();
}

async function seedGroomerCredentials(): Promise<void> {
  const { hashPassword } = await import('../utils/crypto');
  const defaultPassword = await hashPassword('Groomer@123');
  const groomers = await Groomer.findAll({ order: [['id', 'ASC']] });

  for (const groomer of groomers) {
    const code = groomer.groomerCode.toLowerCase();
    const email = groomer.email || `${code}@shearheaven.com`;
    const updates: Record<string, unknown> = {};
    if (!groomer.email) updates.email = email;
    if (!groomer.password) updates.password = defaultPassword;
    if (Object.keys(updates).length > 0) {
      await groomer.update(updates);
    }
  }
}

async function seedMasters(): Promise<void> {
  if ((await ClientMaster.count()) > 0) {
    return;
  }

  await ClientMaster.create({
    clientId: DEFAULT_TENANT.clientId,
    name: 'Shear Heaven',
    isActive: true,
  });

  await RegionMaster.create({
    regionId: DEFAULT_TENANT.regionId,
    clientId: DEFAULT_TENANT.clientId,
    name: 'Darwin',
    isActive: true,
  });

  await StoreMaster.create({
    storeId: DEFAULT_TENANT.storeId,
    clientId: DEFAULT_TENANT.clientId,
    regionId: DEFAULT_TENANT.regionId,
    name: 'Shear Heaven Darwin',
    isActive: true,
    cancellationThresholdHours: 3,
  });

  logger.info('Client, region, and store master sample data seeded');
}

export async function seedScheduleData(): Promise<void> {
  await seedMasters();

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
        groomerCode: groomer.groomerCode,
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
      groomerCode: merisa.groomerCode,
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
      groomerCode: richard.groomerCode,
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
      groomerCode: jeremiah.groomerCode,
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
