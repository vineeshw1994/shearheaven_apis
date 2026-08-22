import { Response, NextFunction } from 'express';
import * as contentService from '../services/content.service';
import { sendSuccess } from '../utils/response';
import { AuthRequest } from '../types/express';
import { validateBody } from '../utils/validation';
import Joi from 'joi';

const chatSendSchema = Joi.object({
  message: Joi.string().trim().min(1).max(2000).required(),
  sessionId: Joi.string().trim().optional(),
  groomerId: Joi.number().integer().positive().optional(),
});

const assistantSchema = Joi.object({
  message: Joi.string().trim().min(1).max(2000).required(),
  sessionId: Joi.string().trim().optional(),
});

export async function getChatHistory(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const sessionId = req.query.sessionId ? String(req.query.sessionId) : undefined;
    const rows = await contentService.getChatHistory(req.user!.id, sessionId);
    sendSuccess(res, 'Chat history retrieved successfully', rows);
  } catch (error) {
    next(error);
  }
}

export async function sendChat(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<{ message: string; sessionId?: string; groomerId?: number }>(chatSendSchema, req.body);
    const row = await contentService.sendChatMessage(req.user!.id, data);
    sendSuccess(res, 'Message sent successfully', row, 201);
  } catch (error) {
    next(error);
  }
}

export async function assistant(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<{ message: string; sessionId?: string }>(assistantSchema, req.body);
    const row = await contentService.assistantReply(req.user!.id, data);
    sendSuccess(res, 'Assistant reply generated successfully', row);
  } catch (error) {
    next(error);
  }
}

export async function getContactInfo(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await contentService.getStoreContent('contact-info', {
      clientId: String(req.query.clientId || req.query.ClientID || req.user?.clientId || ''),
      regionId: String(req.query.regionId || req.query.RegionId || req.user?.regionId || ''),
      storeId: String(req.query.storeId || req.query.StoreId || req.user?.storeId || ''),
    });
    sendSuccess(res, 'Contact info retrieved successfully', row);
  } catch (error) {
    next(error);
  }
}

export async function getAboutUs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await contentService.getStoreContent('about-us', req.query as never);
    sendSuccess(res, 'About us content retrieved successfully', row);
  } catch (error) {
    next(error);
  }
}

export async function getHelpSupport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await contentService.getStoreContent('help-support', req.query as never);
    sendSuccess(res, 'Help & support content retrieved successfully', row);
  } catch (error) {
    next(error);
  }
}

export async function getPrivacyPolicy(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await contentService.getStoreContent('privacy-policy', req.query as never);
    sendSuccess(res, 'Privacy policy retrieved successfully', row);
  } catch (error) {
    next(error);
  }
}

export async function getTermsConditions(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const row = await contentService.getStoreContent('terms-conditions', req.query as never);
    sendSuccess(res, 'Terms & conditions retrieved successfully', row);
  } catch (error) {
    next(error);
  }
}
