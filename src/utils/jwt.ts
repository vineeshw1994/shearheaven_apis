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
