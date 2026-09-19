import fs from 'fs';
import { cert, getApp, getApps, initializeApp } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import { env } from './env';
import { logger } from '../utils/logger';

let initialized = false;

export function initFirebase(): boolean {
  if (initialized || getApps().length > 0) {
    initialized = true;
    return true;
  }

  const serviceAccountPath = env.firebase.serviceAccountPath;
  if (!serviceAccountPath || !fs.existsSync(serviceAccountPath)) {
    logger.warn('Firebase service account file not found; push notifications disabled', {
      path: serviceAccountPath || '(not set)',
    });
    return false;
  }

  try {
    const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
    initializeApp({
      credential: cert(serviceAccount),
    });
    initialized = true;
    logger.info('Firebase Admin SDK initialized', { projectId: getApp().options.projectId });
    return true;
  } catch (error) {
    logger.error('Failed to initialize Firebase Admin SDK', {
      error: error instanceof Error ? error.message : 'Unknown error',
    });
    return false;
  }
}

export function getFirebaseMessaging() {
  if (!initFirebase()) {
    return null;
  }
  return getMessaging();
}
