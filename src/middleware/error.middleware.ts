import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/response';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors,
    });
    return;
  }

  if ('isJoi' in err && (err as { isJoi: boolean }).isJoi) {
    const joiErr = err as { message: string; errors?: string[] };
    res.status(400).json({
      success: false,
      message: joiErr.message || 'Validation failed',
      errors: joiErr.errors,
    });
    return;
  }

  if (err.name === 'SequelizeUniqueConstraintError') {
    res.status(409).json({
      success: false,
      message: 'A record with this value already exists',
      errors: [(err as { errors?: { message: string }[] }).errors?.[0]?.message || 'Duplicate entry'],
    });
    return;
  }

  if (err.name === 'SequelizeValidationError') {
    const validationErrors = (err as { errors?: { message: string }[] }).errors?.map(
      (e) => e.message
    );
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validationErrors,
    });
    return;
  }

  logger.error('Unexpected server error', {
    error: err.message,
    stack: env.isProduction ? undefined : err.stack,
  });

  res.status(500).json({
    success: false,
    message: env.isProduction ? 'Something went wrong' : err.message,
  });
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
}
