import { Router } from 'express';
import * as contentController from '../controllers/content.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/history', authenticate, contentController.getChatHistory);
router.post('/send', authenticate, contentController.sendChat);
router.post('/assistant', authenticate, contentController.assistant);

export default router;
