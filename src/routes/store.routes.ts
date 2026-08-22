import { Router } from 'express';
import * as contentController from '../controllers/content.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/contact-info', authenticate, contentController.getContactInfo);

export default router;
