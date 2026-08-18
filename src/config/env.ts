import dotenv from 'dotenv';

dotenv.config();

const requiredEnvVars = [
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
] as const;

const optionalWithDefaults: Record<string, string> = {
  PORT: '5000',
  DB_HOST: 'localhost',
  DB_PORT: '3306',
  DB_NAME: 'shear_heaven',
  DB_USER: 'root',
  DB_PASSWORD: '',
  JWT_ACCESS_EXPIRES_IN: '1d',
  JWT_REFRESH_EXPIRES_IN: '7d',
  SMTP_HOST: 'smtp.gmail.com',
  SMTP_PORT: '465',
  SMTP_USER: '',
  SMTP_PASSWORD: '',
  SMTP_FROM_NAME: 'Shear Heaven',
  NODE_ENV: 'development',
  BASE_URL: 'http://localhost:5000',
};

export const env = {
  port: parseInt(process.env.PORT || optionalWithDefaults.PORT, 10),
  nodeEnv: process.env.NODE_ENV || optionalWithDefaults.NODE_ENV,
  isProduction: (process.env.NODE_ENV || 'development') === 'production',
  isTest: (process.env.NODE_ENV || 'development') === 'test',

  db: {
    host: process.env.DB_HOST || optionalWithDefaults.DB_HOST,
    port: parseInt(process.env.DB_PORT || optionalWithDefaults.DB_PORT, 10),
    name: process.env.DB_NAME || optionalWithDefaults.DB_NAME,
    user: process.env.DB_USER || optionalWithDefaults.DB_USER,
    password: process.env.DB_PASSWORD || optionalWithDefaults.DB_PASSWORD,
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || '',
    refreshSecret: process.env.JWT_REFRESH_SECRET || '',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || optionalWithDefaults.JWT_ACCESS_EXPIRES_IN,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || optionalWithDefaults.JWT_REFRESH_EXPIRES_IN,
  },

  smtp: {
    host: process.env.SMTP_HOST || optionalWithDefaults.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || optionalWithDefaults.SMTP_PORT, 10),
    user: process.env.SMTP_USER || optionalWithDefaults.SMTP_USER,
    password: process.env.SMTP_PASSWORD || optionalWithDefaults.SMTP_PASSWORD,
    fromName: process.env.SMTP_FROM_NAME || optionalWithDefaults.SMTP_FROM_NAME,
  },

  baseUrl: (process.env.BASE_URL || optionalWithDefaults.BASE_URL).replace(/\/$/, ''),
};

export function validateEnv(): void {
  if (env.isTest) {
    return;
  }

  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
