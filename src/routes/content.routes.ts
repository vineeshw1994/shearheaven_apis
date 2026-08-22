import { Router } from 'express';
import * as contentController from '../controllers/content.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/about-us', authenticate, contentController.getAboutUs);
router.get('/help-support', authenticate, contentController.getHelpSupport);
router.get('/privacy-policy', authenticate, contentController.getPrivacyPolicy);
router.get('/terms-conditions', authenticate, contentController.getTermsConditions);

export default router;
