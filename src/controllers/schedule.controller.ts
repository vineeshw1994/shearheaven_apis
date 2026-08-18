import { Request, Response, NextFunction } from 'express';
import * as scheduleService from '../services/schedule.service';
import { sendSuccess } from '../utils/response';
import { validateBody } from '../utils/validation';
import { groomerAvailabilitySchema } from '../utils/schedule.validation';

function parseGroomerIds(value: unknown): number[] | undefined {
  if (Array.isArray(value)) {
    return value.map((id) => Number(id)).filter((id) => Number.isInteger(id) && id > 0);
  }
  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((id) => Number(id.trim()))
      .filter((id) => Number.isInteger(id) && id > 0);
  }
  if (typeof value === 'number' && value > 0) {
    return [value];
  }
  return undefined;
}

export async function getGroomerAvailability(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const raw = { ...req.query, ...req.body };
    const body = {
      ...raw,
      date: raw.date,
      groomerId: raw.groomerId ? Number(raw.groomerId) : raw.groomerId,
      groomerIds: parseGroomerIds(raw.groomerIds),
      durationMinutes: raw.durationMinutes ? Number(raw.durationMinutes) : undefined,
    };

    const data = validateBody<scheduleService.GroomerAvailabilityInput>(
      groomerAvailabilitySchema,
      body
    );
    const availability = await scheduleService.getGroomerAvailability(data);
    sendSuccess(res, 'Groomer availability retrieved successfully', availability);
  } catch (error) {
    next(error);
  }
}
