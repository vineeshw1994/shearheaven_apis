import { Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';
import { User } from '../models';
import { sendError } from '../utils/response';
import { logger } from '../utils/logger';
import { AuthRequest } from '../types/express';

export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      sendError(res, 'Access token is required', 401);
      return;
    }

    const token = authHeader.split(' ')[1];

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch {
      logger.warn('Authentication failed: invalid or expired access token');
      sendError(res, 'Invalid or expired access token', 401);
      return;
    }

    const user = await User.findByPk(payload.userId);

    if (!user) {
      sendError(res, 'User not found', 401);
      return;
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      emailVerified: user.emailVerified,
      clientId: user.clientId,
      regionId: user.regionId,
      storeId: user.storeId,
    };

    next();
  } catch (error) {
    logger.error('Authentication middleware error', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    sendError(res, 'Authentication failed', 401);
  }
}

export default authenticate;
