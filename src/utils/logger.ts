import winston from 'winston';
import { env } from '../config/env';

const sensitivePatterns = [
  /password/i,
  /otp/i,
  /secret/i,
  /token/i,
  /smtp/i,
  /authorization/i,
];

function sanitizeMeta(meta: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (sensitivePatterns.some((pattern) => pattern.test(key))) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeMeta(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const logger = winston.createLogger({
  level: env.isProduction ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
      const sanitized = sanitizeMeta(meta as Record<string, unknown>);
      const metaStr = Object.keys(sanitized).length ? ` ${JSON.stringify(sanitized)}` : '';
      return `${timestamp} [${level}]: ${message}${metaStr}`;
    })
  ),
  transports: [new winston.transports.Console()],
});
