import { Router } from 'express';
import * as petController from '../controllers/pet.controller';
import { authenticate } from '../middleware/auth.middleware';
import { petUpload } from '../middleware/upload.middleware';
import { requireMultipart, requireProfilePicture } from '../middleware/pet.middleware';

const router = Router();

/**
 * @swagger
 * /api/pets:
 *   post:
 *     tags: [Pets]
 *     summary: Create a new pet with profile picture (multipart/form-data)
 *     security:
 *       - bearerAuth: []
 *   get:
 *     tags: [Pets]
 *     summary: Get all pets for the authenticated user
 *     security:
 *       - bearerAuth: []
 */
router.post(
  '/',
  authenticate,
  requireMultipart,
  petUpload.single('profilePicture'),
  requireProfilePicture,
  petController.createPet
);

router.get('/', authenticate, petController.getPets);

/**
 * @swagger
 * /api/pets/{id}:
 *   get:
 *     tags: [Pets]
 *     summary: Get pet by ID (own pets only)
 *     security:
 *       - bearerAuth: []
 *   put:
 *     tags: [Pets]
 *     summary: Update pet with profile picture (multipart/form-data)
 *     security:
 *       - bearerAuth: []
 *   delete:
 *     tags: [Pets]
 *     summary: Delete pet by ID (own pets only)
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, petController.getPet);

router.put(
  '/:id',
  authenticate,
  requireMultipart,
  petUpload.single('profilePicture'),
  requireProfilePicture,
  petController.updatePet
);

router.delete('/:id', authenticate, petController.deletePet);

export default router;
