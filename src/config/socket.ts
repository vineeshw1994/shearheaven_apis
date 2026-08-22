import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { logger } from '../utils/logger';
import { AccessTokenPayload, DeviceAccessTokenPayload, GroomerAccessTokenPayload } from '../utils/jwt';

let io: Server | null = null;

function getUserRoom(userId: number): string {
  return `user:${userId}`;
}

function getGroomerRoom(groomerId: number): string {
  return `groomer:${groomerId}`;
}

function authenticateSocket(token: string): { type: 'user' | 'groomer' | 'device'; id?: number; deviceId?: string } | null {
  try {
    const payload = jwt.verify(token, env.jwt.accessSecret) as Record<string, unknown>;
    if (payload.tokenType === 'device') {
      const devicePayload = payload as unknown as DeviceAccessTokenPayload;
      return {
        type: 'device',
        id: devicePayload.userId,
        deviceId: devicePayload.deviceId,
      };
    }
    if (payload.role === 'groomer') {
      const groomerPayload = payload as unknown as GroomerAccessTokenPayload;
      return { type: 'groomer', id: groomerPayload.groomerId };
    }
    const userPayload = payload as unknown as AccessTokenPayload;
    if (userPayload.userId) {
      return { type: 'user', id: userPayload.userId };
    }
    return null;
  } catch {
    return null;
  }
}

export function initSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: env.isProduction ? false : '*',
      methods: ['GET', 'POST'],
    },
    path: '/socket.io',
  });

  io.use((socket, next) => {
    const token =
      (socket.handshake.auth?.token as string) ||
      (socket.handshake.headers.authorization as string)?.replace('Bearer ', '');
    if (!token) {
      next(new Error('Authentication token required'));
      return;
    }
    const auth = authenticateSocket(token);
    if (!auth) {
      next(new Error('Invalid token'));
      return;
    }
    socket.data.auth = auth;
    next();
  });

  io.on('connection', (socket: Socket) => {
    const auth = socket.data.auth as { type: string; id?: number };
    if (auth.type === 'user' && auth.id) {
      socket.join(getUserRoom(auth.id));
    }
    if (auth.type === 'groomer' && auth.id) {
      socket.join(getGroomerRoom(auth.id));
    }
    if (auth.type === 'device' && auth.id) {
      socket.join(getUserRoom(auth.id));
    }

    socket.on('disconnect', () => {
      logger.info('Socket disconnected', { socketId: socket.id });
    });
  });

  logger.info('Socket.IO initialized at /socket.io');
  return io;
}

export function emitNotificationToUser(userId: number, payload: Record<string, unknown>): void {
  io?.to(getUserRoom(userId)).emit('notification', payload);
}

export function emitNotificationToGroomer(groomerId: number, payload: Record<string, unknown>): void {
  io?.to(getGroomerRoom(groomerId)).emit('notification', payload);
}

export function getSocketServer(): Server | null {
  return io;
}
