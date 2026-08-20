import { Response, NextFunction } from 'express';
import { verifyGroomerAccessToken } from '../utils/jwt';
import { Groomer } from '../models';
import { sendError } from '../utils/response';
import { GroomerAuthRequest } from '../types/groomer';

export async function authenticateGroomer(
  req: GroomerAuthRequest,
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
      payload = verifyGroomerAccessToken(token);
    } catch {
      sendError(res, 'Invalid or expired access token', 401);
      return;
    }

    if (payload.role !== 'groomer') {
      sendError(res, 'Invalid groomer token', 401);
      return;
    }

    const groomer = await Groomer.findByPk(payload.groomerId);
    if (!groomer || !groomer.isActive) {
      sendError(res, 'Groomer not found', 401);
      return;
    }

    req.groomer = {
      id: groomer.id,
      groomerCode: groomer.groomerCode,
      email: groomer.email,
      firstName: groomer.firstName,
      lastName: groomer.lastName,
      clientId: groomer.clientId,
      regionId: groomer.regionId,
      storeId: groomer.storeId,
    };

    next();
  } catch {
    sendError(res, 'Authentication failed', 401);
  }
}
