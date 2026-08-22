import { Request, Response, NextFunction } from 'express';
import * as offerService from '../services/offer.service';
import * as discountService from '../services/discount.service';
import { sendSuccess } from '../utils/response';
import { validateBody } from '../utils/validation';
import Joi from 'joi';

const validatePromoSchema = Joi.object({
  promoCode: Joi.string().trim().required(),
  orderAmount: Joi.number().min(0).required(),
  clientId: Joi.string().max(50).allow('').optional(),
  regionId: Joi.string().max(50).allow('').optional(),
  storeId: Joi.string().max(50).allow('').optional(),
});

export async function listOffers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rows = await offerService.listOffers(req.query);
    sendSuccess(res, 'Offers retrieved successfully', rows);
  } catch (error) {
    next(error);
  }
}

export async function validatePromo(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validateBody<{ promoCode: string; orderAmount: number; clientId?: string; regionId?: string; storeId?: string }>(
      validatePromoSchema,
      req.body
    );
    const result = await offerService.validatePromoCode(data.promoCode, data.orderAmount, data);
    sendSuccess(res, 'Promo code validated successfully', result);
  } catch (error) {
    next(error);
  }
}

export async function listDiscounts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const rows = await discountService.listDiscounts(req.query);
    sendSuccess(res, 'Discounts retrieved successfully', rows);
  } catch (error) {
    next(error);
  }
}
