import { createApp } from './app';
import { testDatabaseConnection } from './config/database';
import { validateEnv, env } from './config/env';
import { logger } from './utils/logger';
import { ensureModels } from './models';

async function startServer(): Promise<void> {
  try {
    validateEnv();
    await testDatabaseConnection();
    await ensureModels();
    logger.info('Database models synchronized');

    const app = createApp();

    app.listen(env.port, () => {
      logger.info(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
      logger.info(`Swagger docs available at http://localhost:${env.port}/api-docs`);
    });
  } catch (error) {
    logger.error('Failed to start server', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    process.exit(1);
  }
}

startServer();
