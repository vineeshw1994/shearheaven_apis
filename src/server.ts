import { createApp } from './app';
import { testDatabaseConnection } from './config/database';
import { verifyMailConnection } from './config/mailer';
import { validateEnv, env } from './config/env';
import { logger } from './utils/logger';
import { ensureModels } from './models';
import { alignScheduleSchema, seedScheduleData } from './services/schedule.seed';

async function startServer(): Promise<void> {
  try {
    validateEnv();
    await testDatabaseConnection();
    await ensureModels();
    await alignScheduleSchema();
    await seedScheduleData();
    logger.info('Database models synchronized');

    const smtpReady = await verifyMailConnection();
    if (smtpReady) {
      logger.info('SMTP connection verified successfully');
    } else {
      logger.warn('SMTP connection could not be verified. Signup OTP emails may fail.');
    }

    const app = createApp();

    app.listen(env.port, () => {
      logger.info(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
      logger.info(`Swagger docs available at http://localhost:${env.port}/api-docs`);
      logger.info(`Admin panel available at http://localhost:${env.port}/admin`);
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  }
}

startServer();
