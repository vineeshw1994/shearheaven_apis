import { AuthRequest } from '../types/express';

declare global {
  namespace Express {
    interface Request {
      user?: AuthRequest['user'];
    }
  }
}

export {};
