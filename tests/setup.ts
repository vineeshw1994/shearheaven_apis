import dotenv from 'dotenv';

dotenv.config({ path: '.env' });

process.env.NODE_ENV = 'test';
process.env.JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'test_access_secret';
process.env.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'test_refresh_secret';
process.env.DB_NAME = process.env.DB_NAME ? `${process.env.DB_NAME}_test` : 'shear_heaven_test';

jest.mock('../src/services/email.service', () => ({
  sendOtpEmail: jest.fn().mockResolvedValue(undefined),
}));
