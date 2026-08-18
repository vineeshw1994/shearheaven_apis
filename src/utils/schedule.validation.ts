import Joi from 'joi';

const tenantSchema = {
  ClientID: Joi.string().max(50).allow('').optional(),
  RegionId: Joi.string().max(50).allow('').optional(),
  StoreId: Joi.string().max(50).allow('').optional(),
  clientId: Joi.string().max(50).allow('').optional(),
  regionId: Joi.string().max(50).allow('').optional(),
  storeId: Joi.string().max(50).allow('').optional(),
};

const timeSchema = Joi.string()
  .allow('')
  .pattern(/^$|^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/)
  .messages({
    'string.pattern.base': 'Time must be in HH:MM 24-hour format',
  });

const dateSchema = Joi.string()
  .pattern(/^\d{4}-\d{2}-\d{2}$/)
  .messages({
    'string.pattern.base': 'Date must be in YYYY-MM-DD format',
  });

const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const groomerAvailabilitySchema = Joi.object({
  date: dateSchema.required(),
  groomerId: Joi.number().integer().min(0).allow(null).optional(),
  groomerIds: Joi.array().items(Joi.number().integer().positive()).optional(),
  durationMinutes: Joi.number().integer().min(5).max(480).optional(),
  ...tenantSchema,
});

export const groomerCreateSchema = Joi.object({
  groomerCode: Joi.string().trim().max(50).required(),
  firstName: Joi.string().trim().max(100).required(),
  lastName: Joi.string().trim().max(100).required(),
  role: Joi.string().trim().max(100).allow('').optional(),
  highlights: Joi.string().trim().max(500).allow('').optional(),
  type: Joi.string().valid('Groomer', 'Bather').optional(),
  isActive: Joi.boolean().optional(),
  ...tenantSchema,
});

export const groomerUpdateSchema = groomerCreateSchema.fork(
  ['groomerCode', 'firstName', 'lastName'],
  (schema) => schema.optional()
);

export const holidayCreateSchema = Joi.object({
  holidayCode: Joi.string().trim().max(50).required(),
  name: Joi.string().trim().max(150).required(),
  date: dateSchema.required(),
  description: Joi.string().trim().max(500).allow('').optional(),
  isStoreSpecific: Joi.boolean().optional(),
  ...tenantSchema,
});

export const holidayUpdateSchema = holidayCreateSchema.fork(
  ['holidayCode', 'name', 'date'],
  (schema) => schema.optional()
);

export const storeHourCreateSchema = Joi.object({
  dayOfWeek: Joi.string()
    .valid(...days)
    .required(),
  isOpen: Joi.boolean().optional(),
  startTime: timeSchema.optional(),
  endTime: timeSchema.optional(),
  ...tenantSchema,
});

export const storeHourUpdateSchema = storeHourCreateSchema.fork(['dayOfWeek'], (schema) =>
  schema.optional()
);

export const groomerHourCreateSchema = Joi.object({
  groomerId: Joi.number().integer().positive().required(),
  dayOfWeek: Joi.string()
    .valid(...days)
    .required(),
  isWorking: Joi.boolean().optional(),
  startTime: timeSchema.optional(),
  endTime: timeSchema.optional(),
  ...tenantSchema,
});

export const groomerHourUpdateSchema = groomerHourCreateSchema.fork(
  ['groomerId', 'dayOfWeek'],
  (schema) => schema.optional()
);

export const unavailabilityCreateSchema = Joi.object({
  groomerId: Joi.number().integer().positive().required(),
  startDate: dateSchema.required(),
  endDate: dateSchema.required(),
  startTime: timeSchema.optional(),
  endTime: timeSchema.optional(),
  reason: Joi.string().trim().max(255).allow('').optional(),
  leaveType: Joi.string().valid('leave', 'break', 'unavailable', 'other').optional(),
  ...tenantSchema,
});

export const unavailabilityUpdateSchema = unavailabilityCreateSchema.fork(
  ['groomerId', 'startDate', 'endDate'],
  (schema) => schema.optional()
);
