import { Router } from 'express';
import * as offerController from '../controllers/offer.controller';

const router = Router();

router.get('/', offerController.listOffers);
router.post('/validate-promo', offerController.validatePromo);

export default router;
