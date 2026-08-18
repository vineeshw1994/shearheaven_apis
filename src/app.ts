import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import path from 'path';
import routes from './routes';
import { swaggerSpec } from './config/swagger';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import { env } from './config/env';

export function createApp(): Application {
  const app = express();

  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }));

  app.use(cors({
    origin: env.isProduction ? false : true,
    credentials: true,
  }));

  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000,
      max: 100,
      standardHeaders: true,
      legacyHeaders: false,
      skip: (req) => req.path.startsWith('/admin') || req.path.startsWith('/api/admin'),
      message: {
        success: false,
        message: 'Too many requests. Please try again later.',
      },
    })
  );

  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));
  app.use('/services_img', express.static(path.join(process.cwd(), 'services_img')));
  app.use('/admin', express.static(path.join(process.cwd(), 'public', 'admin')));

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/api-docs.json', (_req, res) => {
    res.json(swaggerSpec);
  });

  app.get('/health', (_req, res) => {
    res.json({ success: true, message: 'Server is running' });
  });

  app.use('/api', routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

export default createApp;
