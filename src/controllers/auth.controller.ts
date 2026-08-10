import { Request, Response, NextFunction } from 'express';
import * as authService from '../services/auth.service';
import { sendSuccess } from '../utils/response';
import { signupSchema, loginSchema, refreshTokenSchema, sendOtpSchema, verifyOtpSchema } from '../utils/validation';
import { validateBody } from '../utils/validation';
import { AuthRequest } from '../types/express';

export async function signup(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<{
      name: string;
      email: string;
      mobile: string;
      password: string;
      clientId?: string;
      regionId?: string;
      storeId?: string;
    }>(signupSchema, req.body);

    const result = await authService.signupUser(data);
    sendSuccess(res, result.message, { email: result.email });
  } catch (error) {
    next(error);
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = validateBody<{ email: string; password: string }>(loginSchema, req.body);
    const result = await authService.loginUser(email, password);
    sendSuccess(res, 'Login successful', result);
  } catch (error) {
    next(error);
  }
}

export async function refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = validateBody<{ refreshToken: string }>(refreshTokenSchema, req.body);
    const result = await authService.refreshAccessToken(refreshToken);
    sendSuccess(res, 'Access token refreshed successfully', result);
  } catch (error) {
    next(error);
  }
}

export async function sendOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<{ email: string; clientId?: string; regionId?: string; storeId?: string }>(
      sendOtpSchema,
      req.body
    );
    const result = await authService.sendOtp(data.email, {
      clientId: data.clientId,
      regionId: data.regionId,
      storeId: data.storeId,
    });
    sendSuccess(res, result.message);
  } catch (error) {
    next(error);
  }
}

export async function verifyOtp(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, otp } = validateBody<{ email: string; otp: string }>(verifyOtpSchema, req.body);
    const result = await authService.verifyOtp(email, otp);
    sendSuccess(res, 'Login successful', result);
  } catch (error) {
    next(error);
  }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.body.refreshToken as string | undefined;
    await authService.logoutUser(req.user!.id, refreshToken);
    sendSuccess(res, 'Logout successful');
  } catch (error) {
    next(error);
  }
}
