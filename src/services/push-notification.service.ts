import { NotificationDeviceToken } from '../models';
import { getFirebaseMessaging } from '../config/firebase';
import { logger } from '../utils/logger';

interface PushPayload {
  title: string;
  body: string;
  data?: Record<string, unknown>;
}

function stringifyData(data: Record<string, unknown> = {}): Record<string, string> {
  return Object.fromEntries(
    Object.entries(data).map(([key, value]) => [key, value == null ? '' : String(value)])
  );
}

async function sendPushToTokens(tokens: string[], payload: PushPayload): Promise<void> {
  const messaging = getFirebaseMessaging();
  if (!messaging || tokens.length === 0) {
    return;
  }

  const response = await messaging.sendEachForMulticast({
    tokens,
    notification: {
      title: payload.title,
      body: payload.body,
    },
    data: stringifyData(payload.data),
  });

  if (response.failureCount > 0) {
    logger.warn('Some Firebase push notifications failed', {
      successCount: response.successCount,
      failureCount: response.failureCount,
    });
  }
}

export async function sendPushToUser(userId: number, payload: PushPayload): Promise<void> {
  const rows = await NotificationDeviceToken.findAll({ where: { userId } });
  const tokens = rows.map((row) => row.pushToken).filter(Boolean);
  await sendPushToTokens(tokens, payload);
}

export async function sendPushToGroomer(groomerId: number, payload: PushPayload): Promise<void> {
  const rows = await NotificationDeviceToken.findAll({ where: { groomerId } });
  const tokens = rows.map((row) => row.pushToken).filter(Boolean);
  await sendPushToTokens(tokens, payload);
}
