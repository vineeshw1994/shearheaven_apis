import { randomUUID } from 'crypto';
import { ChatMessage } from '../models';
import { NotFoundError } from '../utils/response';

export async function getChatHistory(userId: number, sessionId?: string): Promise<Record<string, unknown>[]> {
  const where: Record<string, unknown> = { userId };
  if (sessionId) where.sessionId = sessionId;
  const rows = await ChatMessage.findAll({
    where,
    order: [['createdAt', 'ASC']],
    limit: 100,
  });
  return rows.map((row) => ({
    id: row.id,
    message: row.message,
    senderType: row.senderType,
    sessionId: row.sessionId,
    createdAt: (row as unknown as { createdAt?: Date }).createdAt,
  }));
}

export async function sendChatMessage(
  userId: number,
  input: { message: string; sessionId?: string; groomerId?: number }
): Promise<Record<string, unknown>> {
  const sessionId = input.sessionId || randomUUID();
  const row = await ChatMessage.create({
    userId,
    groomerId: input.groomerId || null,
    senderType: 'user',
    message: input.message,
    sessionId,
  });
  return {
    id: row.id,
    message: row.message,
    senderType: row.senderType,
    sessionId: row.sessionId,
    createdAt: (row as unknown as { createdAt?: Date }).createdAt,
  };
}

export async function assistantReply(userId: number, input: { message: string; sessionId?: string }): Promise<Record<string, unknown>> {
  const sessionId = input.sessionId || randomUUID();
  await ChatMessage.create({
    userId,
    senderType: 'user',
    message: input.message,
    sessionId,
  });

  const replyText =
    'Thanks for your message. Our store team will assist you shortly. For urgent booking help, please call the store or use the booking section in the app.';

  const reply = await ChatMessage.create({
    userId,
    senderType: 'assistant',
    message: replyText,
    sessionId,
  });

  return {
    sessionId,
    reply: {
      id: reply.id,
      message: reply.message,
      senderType: reply.senderType,
      createdAt: (reply as unknown as { createdAt?: Date }).createdAt,
    },
  };
}

export async function getStoreContent(
  contentKey: string,
  tenant: { clientId?: string; regionId?: string; storeId?: string } = {}
): Promise<Record<string, unknown>> {
  const { StoreContent } = await import('../models');
  const where: Record<string, unknown> = { contentKey, isActive: true };
  if (tenant.clientId) where.clientId = tenant.clientId;
  if (tenant.regionId) where.regionId = tenant.regionId;
  if (tenant.storeId) where.storeId = tenant.storeId;

  const row = await StoreContent.findOne({ where });
  if (!row) {
    return {
      contentKey,
      title: contentKey.replace(/-/g, ' '),
      body: '',
      metadata: {},
    };
  }
  return {
    contentKey: row.contentKey,
    title: row.title,
    body: row.body,
    metadata: row.metadata,
  };
}

export async function upsertStoreContent(body: Record<string, unknown>): Promise<Record<string, unknown>> {
  const { StoreContent } = await import('../models');
  const contentKey = String(body.contentKey);
  const where = {
    contentKey,
    clientId: String(body.clientId || ''),
    regionId: String(body.regionId || ''),
    storeId: String(body.storeId || ''),
  };
  const existing = await StoreContent.findOne({ where });
  if (existing) {
    await existing.update(body);
    return existing.toJSON() as Record<string, unknown>;
  }
  const created = await StoreContent.create(body as never);
  return created.toJSON() as Record<string, unknown>;
}

export async function listStoreContent(query: Record<string, string> = {}) {
  const { StoreContent } = await import('../models');
  const where: Record<string, unknown> = {};
  if (query.clientId) where.clientId = query.clientId;
  if (query.regionId) where.regionId = query.regionId;
  if (query.storeId) where.storeId = query.storeId;
  return StoreContent.findAll({ where, order: [['contentKey', 'ASC']] });
}

export async function deleteStoreContent(id: number) {
  const { StoreContent } = await import('../models');
  const row = await StoreContent.findByPk(id);
  if (!row) throw new NotFoundError('Content not found');
  await row.destroy();
}
