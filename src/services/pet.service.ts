import { Pet } from '../models';
import { NotFoundError, ForbiddenError } from '../utils/response';
import { getProfilePictureUrl } from '../middleware/upload.middleware';

interface PetInput {
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
  profilePicture?: string | null;
  clientId?: string;
  regionId?: string;
  storeId?: string;
}

function formatPet(pet: Pet): Record<string, unknown> {
  return {
    id: pet.id,
    userId: pet.userId,
    profilePicture: getProfilePictureUrl(pet.profilePicture),
    petName: pet.petName,
    breed: pet.breed,
    weight: pet.weight,
    age: pet.age,
    dateOfBirth: pet.dateOfBirth,
    gender: pet.gender,
    notesAllergies: pet.notesAllergies,
    allVaccinatedCurrent: pet.allVaccinatedCurrent,
    lastVaccinatedDate: pet.lastVaccinatedDate,
    behaviorNotes: pet.behaviorNotes,
    clientId: pet.clientId,
    regionId: pet.regionId,
    storeId: pet.storeId,
  };
}

export async function createPet(
  userId: number,
  input: PetInput,
  tenant: { clientId: string; regionId: string; storeId: string }
): Promise<Record<string, unknown>> {
  const pet = await Pet.create({
    userId,
    petName: input.petName,
    breed: input.breed,
    weight: input.weight,
    age: input.age ?? null,
    dateOfBirth: input.dateOfBirth ?? null,
    gender: (input.gender ?? 'unknown') as 'male' | 'female' | 'unknown',
    notesAllergies: input.notesAllergies ?? null,
    allVaccinatedCurrent: input.allVaccinatedCurrent ?? false,
    lastVaccinatedDate: input.lastVaccinatedDate ?? null,
    behaviorNotes: input.behaviorNotes ?? null,
    profilePicture: input.profilePicture ?? null,
    clientId: input.clientId ?? tenant.clientId,
    regionId: input.regionId ?? tenant.regionId,
    storeId: input.storeId ?? tenant.storeId,
  });

  return formatPet(pet);
}

export async function getUserPets(userId: number): Promise<Record<string, unknown>[]> {
  const pets = await Pet.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']],
  });

  return pets.map(formatPet);
}

export async function getPetById(userId: number, petId: number): Promise<Record<string, unknown>> {
  const pet = await Pet.findByPk(petId);

  if (!pet) {
    throw new NotFoundError('Pet not found');
  }

  if (pet.userId !== userId) {
    throw new ForbiddenError('You do not have access to this pet');
  }

  return formatPet(pet);
}

export async function updatePet(
  userId: number,
  petId: number,
  input: Partial<PetInput>
): Promise<Record<string, unknown>> {
  const pet = await Pet.findByPk(petId);

  if (!pet) {
    throw new NotFoundError('Pet not found');
  }

  if (pet.userId !== userId) {
    throw new ForbiddenError('You do not have access to this pet');
  }

  await pet.update(input);
  return formatPet(pet);
}

export async function deletePet(userId: number, petId: number) {
  const pet = await Pet.findByPk(petId);

  if (!pet) {
    throw new NotFoundError('Pet not found');
  }

  if (pet.userId !== userId) {
    throw new ForbiddenError('You do not have access to this pet');
  }

  await pet.destroy();
}
