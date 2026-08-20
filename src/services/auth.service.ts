import { Op } from 'sequelize';
import { User, Otp, RefreshToken, PendingSignup } from '../models';
import {
  hashPassword,
  comparePassword,
  generateOtp,
  hashToken,
  compareToken,
} from '../utils/crypto';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiryDate,
  getOtpExpiryDate,
} from '../utils/jwt';
import { sendOtpEmail } from './email.service';
import {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  AppError,
} from '../utils/response';
import { logger } from '../utils/logger';

const MAX_OTP_ATTEMPTS = 5;

interface SignupInput {
  name: string;
  email: string;
  mobile: string;
  password: string;
  clientId?: string;
  regionId?: string;
  storeId?: string;
}

interface TenantInput {
  clientId?: string;
  regionId?: string;
  storeId?: string;
}

export interface AuthTokenResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    mobile: string;
  };
}

async function ensureEmailAndMobileAvailable(email: string, mobile: string): Promise<void> {
  const existingEmail = await User.findOne({ where: { email } });
  if (existingEmail) {
    throw new ConflictError('Email is already registered');
  }

  const existingMobile = await User.findOne({ where: { mobile } });
  if (existingMobile) {
    throw new ConflictError('Mobile number is already registered');
  }

  const pendingMobile = await PendingSignup.findOne({
    where: {
      mobile,
      verified: false,
      expiresAt: { [Op.gt]: new Date() },
    },
  });
  if (pendingMobile && pendingMobile.email !== email) {
    throw new ConflictError('Mobile number is already registered');
  }
}

export async function signupUser(input: SignupInput): Promise<{ message: string; email: string }> {
  await ensureEmailAndMobileAvailable(input.email, input.mobile);

  const hashedPassword = await hashPassword(input.password);
  const otp = generateOtp();
  const otpHash = await hashToken(otp);

  await PendingSignup.update(
    { verified: true },
    { where: { email: input.email, verified: false } }
  );

  await PendingSignup.create({
    name: input.name,
    email: input.email,
    mobile: input.mobile,
    password: hashedPassword,
    otpHash,
    expiresAt: getOtpExpiryDate(),
    clientId: input.clientId || '',
    regionId: input.regionId || '',
    storeId: input.storeId || '',
  });

  await sendOtpEmail(input.email, otp, input.name);

  return {
    message: 'OTP sent to your email. Please verify to complete registration.',
    email: input.email,
  };
}

export async function loginUser(email: string, password: string): Promise<AuthTokenResponse> {
  const user = await User.findOne({ where: { email } });

  if (!user) {
    logger.warn('Login failed: user not found');
    throw new UnauthorizedError('Invalid email or password');
  }

  const isValid = await comparePassword(password, user.password);
  if (!isValid) {
    logger.warn('Login failed: invalid password');
    throw new UnauthorizedError('Invalid email or password');
  }

  return generateAuthTokens(user);
}

async function generateAuthTokens(user: User): Promise<AuthTokenResponse> {
  const refreshRecord = await RefreshToken.create({
    userId: user.id,
    tokenHash: '',
    expiresAt: getRefreshTokenExpiryDate(),
    clientId: user.clientId,
    regionId: user.regionId,
    storeId: user.storeId,
  });

  const refreshToken = generateRefreshToken({
    userId: user.id,
    tokenId: refreshRecord.id,
  });

  const tokenHash = await hashToken(refreshToken);
  await refreshRecord.update({ tokenHash });

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
    },
  };
}

export async function refreshAccessToken(refreshToken: string) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const tokenRecord = await RefreshToken.findByPk(payload.tokenId);

  if (!tokenRecord || tokenRecord.revoked) {
    throw new UnauthorizedError('Refresh token has been revoked');
  }

  if (tokenRecord.expiresAt < new Date()) {
    throw new UnauthorizedError('Refresh token has expired');
  }

  const isValid = await compareToken(refreshToken, tokenRecord.tokenHash);
  if (!isValid) {
    throw new UnauthorizedError('Invalid refresh token');
  }

  const user = await User.findByPk(payload.userId);
  if (!user) {
    throw new UnauthorizedError('User not found');
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
  });

  return { accessToken };
}

async function verifySignupOtp(email: string, otp: string): Promise<AuthTokenResponse | null> {
  const pendingSignup = await PendingSignup.findOne({
    where: {
      email,
      verified: false,
      expiresAt: { [Op.gt]: new Date() },
    },
    order: [['createdAt', 'DESC']],
  });

  if (!pendingSignup) {
    return null;
  }

  if (pendingSignup.attempts >= MAX_OTP_ATTEMPTS) {
    throw new AppError('Too many OTP attempts. Please sign up again to receive a new OTP', 429);
  }

  const isValid = await compareToken(otp, pendingSignup.otpHash);
  if (!isValid) {
    await pendingSignup.increment('attempts');
    throw new AppError('Invalid OTP', 400);
  }

  await ensureEmailAndMobileAvailable(pendingSignup.email, pendingSignup.mobile);

  const user = await User.create({
    name: pendingSignup.name,
    email: pendingSignup.email,
    mobile: pendingSignup.mobile,
    password: pendingSignup.password,
    emailVerified: true,
    clientId: pendingSignup.clientId,
    regionId: pendingSignup.regionId,
    storeId: pendingSignup.storeId,
  });

  await pendingSignup.update({ verified: true });

  return generateAuthTokens(user);
}

export async function sendOtp(email: string, tenant: TenantInput = {}) {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new NotFoundError('No account found with this email');
  }

  if (user.emailVerified) {
    throw new ConflictError('Email is already verified');
  }

  const otp = generateOtp();
  const otpHash = await hashToken(otp);

  await Otp.update(
    { verified: true },
    { where: { email, verified: false } }
  );

  await Otp.create({
    email,
    otpHash,
    expiresAt: getOtpExpiryDate(),
    clientId: tenant.clientId || user.clientId,
    regionId: tenant.regionId || user.regionId,
    storeId: tenant.storeId || user.storeId,
  });

  await sendOtpEmail(email, otp, user.name);

  return { message: 'OTP sent successfully' };
}

export async function verifyOtp(email: string, otp: string): Promise<AuthTokenResponse> {
  const signupResult = await verifySignupOtp(email, otp);
  if (signupResult) {
    return signupResult;
  }

  const otpRecord = await Otp.findOne({
    where: {
      email,
      verified: false,
      expiresAt: { [Op.gt]: new Date() },
    },
    order: [['createdAt', 'DESC']],
  });

  if (!otpRecord) {
    throw new AppError('OTP has expired or is invalid', 400);
  }

  if (otpRecord.attempts >= MAX_OTP_ATTEMPTS) {
    throw new AppError('Too many OTP attempts. Please request a new OTP', 429);
  }

  const isValid = await compareToken(otp, otpRecord.otpHash);

  if (!isValid) {
    await otpRecord.increment('attempts');
    throw new AppError('Invalid OTP', 400);
  }

  await otpRecord.update({ verified: true });

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  await user.update({ emailVerified: true });

  return generateAuthTokens(user);
}

export async function logoutUser(userId: number, refreshToken?: string) {
  if (refreshToken) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const tokenRecord = await RefreshToken.findByPk(payload.tokenId);

      if (tokenRecord && tokenRecord.userId === userId && !tokenRecord.revoked) {
        await tokenRecord.update({ revoked: true });
        return;
      }
    } catch {
      // Fall through to revoke all tokens
    }
  }

  await RefreshToken.update(
    { revoked: true },
    { where: { userId, revoked: false } }
  );
}

export async function getUserProfile(userId: number): Promise<Record<string, unknown>> {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user.toSafeJSON();
}

export interface ProfileUpdateInput {
  name?: string;
  mobile?: string;
}

export async function updateUserProfile(
  userId: number,
  input: ProfileUpdateInput
): Promise<Record<string, unknown>> {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new NotFoundError('User not found');
  }

  const updates: Partial<{ name: string; mobile: string }> = {};

  if (input.name !== undefined) {
    updates.name = input.name;
  }

  if (input.mobile !== undefined && input.mobile !== user.mobile) {
    const existingMobile = await User.findOne({
      where: {
        mobile: input.mobile,
        id: { [Op.ne]: userId },
      },
    });
    if (existingMobile) {
      throw new ConflictError('Mobile number is already registered');
    }
    updates.mobile = input.mobile;
  }

  if (Object.keys(updates).length === 0) {
    return user.toSafeJSON();
  }

  await user.update(updates);
  return user.toSafeJSON();
}

export async function checkForgotPasswordEmail(email: string): Promise<{ exists: boolean }> {
  const user = await User.findOne({ where: { email } });
  return { exists: Boolean(user) };
}

export async function resetUserPassword(
  email: string,
  password: string
): Promise<{ email: string }> {
  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new NotFoundError('No account found with this email');
  }

  const hashedPassword = await hashPassword(password);
  await user.update({ password: hashedPassword });

  await RefreshToken.update(
    { revoked: true },
    { where: { userId: user.id, revoked: false } }
  );

  return { email: user.email };
}

export { generateOtp, getOtpExpiryDate };
