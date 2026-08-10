import { Response, NextFunction } from 'express';
import * as petService from '../services/pet.service';
import { sendSuccess, ValidationError } from '../utils/response';
import { petSchema, petUpdateSchema, validatePetForm } from '../utils/validation';
import { AuthRequest } from '../types/express';

export async function createPet(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = validatePetForm<{
      petName: string;
      breed: string;
      weight: string;
      age?: number | null;
      dateOfBirth?: Date | null;
      gender?: string;
      notesAllergies?: string | null;
      allVaccinatedCurrent?: boolean;
      lastVaccinatedDate?: Date | null;
      behaviorNotes?: string | null;
      clientId?: string;
      regionId?: string;
      storeId?: string;
    }>(petSchema, req.body as Record<string, unknown>);

    const pet = await petService.createPet(
      req.user!.id,
      { ...data, profilePicture: req.file!.filename },
      {
        clientId: req.user!.clientId,
        regionId: req.user!.regionId,
        storeId: req.user!.storeId,
      }
    );

    sendSuccess(res, 'Pet created successfully', { pet }, 201);
  } catch (error) {
    next(error);
  }
}

export async function getPets(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;
    const pets = await petService.getUserPets(userId);
    sendSuccess(res, 'Request successful', { userId, pets });
  } catch (error) {
    next(error);
  }
}

export async function getPet(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const petId = parseInt(String(req.params.id), 10);

    if (Number.isNaN(petId)) {
      throw new ValidationError('Invalid pet ID');
    }

    const pet = await petService.getPetById(req.user!.id, petId);
    sendSuccess(res, 'Request successful', { pet });
  } catch (error) {
    next(error);
  }
}

export async function updatePet(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const petId = parseInt(String(req.params.id), 10);

    if (Number.isNaN(petId)) {
      throw new ValidationError('Invalid pet ID');
    }

    const data = validatePetForm<Partial<{
      petName: string;
      breed: string;
      weight: string;
      age?: number | null;
      dateOfBirth?: Date | null;
      gender?: string;
      notesAllergies?: string | null;
      allVaccinatedCurrent?: boolean;
      lastVaccinatedDate?: Date | null;
      behaviorNotes?: string | null;
    }>>(petUpdateSchema, req.body as Record<string, unknown>);

    const updateData: Partial<{
      petName: string;
      breed: string;
      weight: string;
      age?: number | null;
      dateOfBirth?: Date | null;
      gender?: string;
      notesAllergies?: string | null;
      allVaccinatedCurrent?: boolean;
      lastVaccinatedDate?: Date | null;
      behaviorNotes?: string | null;
      profilePicture?: string;
    }> = { ...data };

    if (req.file) {
      updateData.profilePicture = req.file.filename;
    }

    const pet = await petService.updatePet(req.user!.id, petId, updateData);
    sendSuccess(res, 'Pet updated successfully', { pet });
  } catch (error) {
    next(error);
  }
}

export async function deletePet(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const petId = parseInt(String(req.params.id), 10);

    if (Number.isNaN(petId)) {
      throw new ValidationError('Invalid pet ID');
    }

    await petService.deletePet(req.user!.id, petId);
    sendSuccess(res, 'Pet deleted successfully');
  } catch (error) {
    next(error);
  }
}
