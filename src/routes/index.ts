import { Router } from 'express';
import authRoutes from './auth.routes';
import dataRoutes from './data.routes';
import petRoutes from './pet.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/', dataRoutes);
router.use('/pets', petRoutes);

export default router;
