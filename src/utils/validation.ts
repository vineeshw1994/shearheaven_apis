import Joi from 'joi';

const passwordSchema = Joi.string()
  .min(8)
  .max(128)
  .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]+$/)
  .messages({
    'string.pattern.base':
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  });

const mobileSchema = Joi.string()
  .pattern(/^[0-9]{10,15}$/)
  .messages({
    'string.pattern.base': 'Mobile number must be 10-15 digits',
  });

const tenantSchema = {
  clientId: Joi.string().max(50).allow('').optional(),
  regionId: Joi.string().max(50).allow('').optional(),
  storeId: Joi.string().max(50).allow('').optional(),
};

export const signupSchema = Joi.object({
  name: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().required(),
  mobile: mobileSchema.required(),
  password: passwordSchema.required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required().messages({
    'any.only': 'Password and confirm password must match',
  }),
  ...tenantSchema,
});

export const loginSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  password: Joi.string().required(),
});

export const refreshTokenSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const sendOtpSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  ...tenantSchema,
});

export const verifyOtpSchema = Joi.object({
  email: Joi.string().trim().email().required(),
  otp: Joi.string().pattern(/^[0-9]{6}$/).required().messages({
    'string.pattern.base': 'OTP must be a 6-digit number',
  }),
});

export const petSchema = Joi.object({
  petName: Joi.string().trim().min(1).max(100).required(),
  breed: Joi.string().trim().min(1).max(100).required(),
  weight: Joi.string().trim().min(1).max(50).required(),
  age: Joi.number().integer().min(0).max(50).allow(null).optional(),
  dateOfBirth: Joi.date().iso().allow(null).optional(),
  gender: Joi.string().valid('male', 'female', 'unknown').default('unknown'),
  notesAllergies: Joi.string().max(2000).allow('', null).optional(),
  allVaccinatedCurrent: Joi.boolean().default(false),
  lastVaccinatedDate: Joi.date().iso().allow(null).optional(),
  behaviorNotes: Joi.string().max(2000).allow('', null).optional(),
  ...tenantSchema,
});

export const petUpdateSchema = petSchema.fork(
  ['petName', 'breed', 'weight'],
  (schema) => schema.optional()
);

function coerceFormValue(value: unknown): unknown {
  if (value === '' || value === 'null' || value === 'undefined') {
    return null;
  }
  return value;
}

export function normalizePetFormBody(body: Record<string, unknown>): Record<string, unknown> {
  const normalized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(body)) {
    normalized[key] = coerceFormValue(value);
  }

  if (typeof normalized.age === 'string' && normalized.age !== null) {
    normalized.age = parseInt(normalized.age, 10);
  }

  if (typeof normalized.allVaccinatedCurrent === 'string') {
    normalized.allVaccinatedCurrent = normalized.allVaccinatedCurrent === 'true';
  }

  return normalized;
}

export function validatePetForm<T>(schema: Joi.ObjectSchema, body: Record<string, unknown>): T {
  return validateBody<T>(schema, normalizePetFormBody(body));
}

export function validateBody<T>(schema: Joi.ObjectSchema, data: unknown): T {
  const { error, value } = schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = error.details.map((detail) => detail.message);
    throw { isJoi: true, errors, message: 'Validation failed' };
  }

  return value as T;
}
