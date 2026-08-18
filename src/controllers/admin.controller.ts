import { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service';
import { sendSuccess } from '../utils/response';
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
} from '../utils/schedule.validation';

function idParam(req: Request): number {
  return Number(req.params.id);
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
      groomerId: req.query.groomerId ? Number(req.query.groomerId) : undefined,
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
      groomerId: req.query.groomerId ? Number(req.query.groomerId) : undefined,
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
