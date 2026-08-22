import jwt from 'jsonwebtoken';
import { env } from '../config/env';

export interface AccessTokenPayload {
  userId: number;
  email: string;
}

export interface RefreshTokenPayload {
  userId: number;
  tokenId: number;
}

export interface GroomerAccessTokenPayload {
  groomerId: number;
  email: string;
  role: 'groomer';
}

export interface GroomerRefreshTokenPayload {
  groomerId: number;
  tokenId: number;
}

export interface DeviceAccessTokenPayload {
  deviceId: string;
  userType: 'guest' | 'registered' | 'admin' | 'groomer' | 'bather';
  userId?: number;
  tokenType: 'device';
}

export function generateDeviceAccessToken(payload: Omit<DeviceAccessTokenPayload, 'tokenType'>): string {
  return jwt.sign({ ...payload, tokenType: 'device' }, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  } as jwt.SignOptions);
}

export function verifyDeviceAccessToken(token: string): DeviceAccessTokenPayload {
  const payload = jwt.verify(token, env.jwt.accessSecret) as DeviceAccessTokenPayload;
  if (payload.tokenType !== 'device') {
    throw new Error('Invalid device token');
  }
  return payload;
}

export function generateGroomerRefreshToken(payload: GroomerRefreshTokenPayload): string {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
}

export function verifyGroomerRefreshToken(token: string): GroomerRefreshTokenPayload {
  return jwt.verify(token, env.jwt.refreshSecret) as GroomerRefreshTokenPayload;
}

export function generateGroomerAccessToken(payload: GroomerAccessTokenPayload): string {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  } as jwt.SignOptions);
}

export function verifyGroomerAccessToken(token: string): GroomerAccessTokenPayload {
  return jwt.verify(token, env.jwt.accessSecret) as GroomerAccessTokenPayload;
}

export function generateAccessToken(payload: AccessTokenPayload): string {
  return jwt.sign(payload, env.jwt.accessSecret, {
    expiresIn: env.jwt.accessExpiresIn,
  } as jwt.SignOptions);
}

export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiresIn,
  } as jwt.SignOptions);
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.jwt.accessSecret) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.jwt.refreshSecret) as RefreshTokenPayload;
}

export function getRefreshTokenExpiryDate(): Date {
  const expiresIn = env.jwt.refreshExpiresIn;
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  if (!match) {
    return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];
  const multipliers: Record<string, number> = {
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  };

  return new Date(Date.now() + value * (multipliers[unit] || multipliers.d));
}

export function getOtpExpiryDate(): Date {
  return new Date(Date.now() + 5 * 60 * 1000);
}
