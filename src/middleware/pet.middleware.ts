import { Response, NextFunction } from 'express';
import { sendError } from '../utils/response';
import { AuthRequest } from '../types/express';

export function requireMultipart(req: AuthRequest, res: Response, next: NextFunction): void {
  const contentType = req.headers['content-type'] || '';

  if (!contentType.includes('multipart/form-data')) {
    sendError(res, 'Content-Type must be multipart/form-data', 400);
    return;
  }

  next();
}

export function requireProfilePicture(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.file) {
    sendError(res, 'Profile picture is required', 400);
    return;
  }

  next();
}
