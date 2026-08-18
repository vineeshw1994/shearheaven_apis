import fs from 'fs';
import path from 'path';
import { env } from '../config/env';

const DATA_DIR = path.join(__dirname, '..', 'data');

function readJsonFile<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T;
}

function buildServiceImageUrl(filename: string): string {
  return `${env.baseUrl}/services_img/${filename}`;
}

const SERVICE_NAME_IMAGES: Record<string, string> = {
  'Nail Grinding': 'svc_nail_trim.png',
  'Teeth Brushing': 'svc_teeth_brush.png',
  'Blueberry Facial': 'svc_skin_care.png',
  'Flea Bath': 'svc_flea_tick.png',
  Furminator: 'svc_deshed.png',
  'Dental Package': 'svc_teeth_brush.png',
  'Medicated Bath': 'svc_bath_blowdry.png',
  'De-Odorize': 'svc_spa.png',
  'Brush/Dematt': 'svc_deshed.png',
  'Hard To Handle': 'svc_puppy.png',
  'Express Service': 'svc_spa.png',
  Scissoring: 'svc_hair_trim.png',
  'Nail Trim': 'svc_nail_trim.png',
  'Nail Grind': 'svc_nail_trim.png',
  'Anal Glands': 'svc_ear_clean.png',
  'Face & Feet Trim': 'svc_hair_trim.png',
};

const BREED_SERVICE_IMAGES: Record<string, string> = {
  Grooming: 'svc_full_grooming.png',
  Bathing: 'svc_bath_blowdry.png',
  GroomingAndBathing: 'svc_spa.png',
};

interface BreedServiceRecord {
  Price: string;
  TimeinMinutes: string;
}

interface ServicesPackagesBreed {
  BreedTypeId: string;
  BreedType: string;
  Grooming: BreedServiceRecord;
  Bathing: BreedServiceRecord;
  GroomingAndBathing: BreedServiceRecord;
  BreedExample?: unknown[];
}

interface ServicesPackagesPackage {
  PackageId?: string;
  PackageName?: string;
  TimeinMinutes?: string;
  Includes?: string[];
  Price?: string;
}

interface ServicesPackagesAddOn {
  AddOnId: string;
  Name: string;
  Price: string;
  TimeinMinutes: string;
  Sufix?: string;
  Includes?: string[];
}

interface ServicesPackagesWalkIn {
  WalkInServiceId: string;
  Name: string;
  TimeinMinutes: string;
  Price: string;
}

function getImageUrlByName(name?: string): string | null {
  if (!name) return null;
  const filename = SERVICE_NAME_IMAGES[name];
  return filename ? buildServiceImageUrl(filename) : null;
}

function enrichNamedItem<T extends { Name?: string }>(item: T): T & { imageUrl: string | null } {
  return {
    ...item,
    imageUrl: getImageUrlByName(item.Name),
  };
}

function enrichBreedServices(breed: ServicesPackagesBreed) {
  return {
    ...breed,
    imageUrl: buildServiceImageUrl('svc_breed_style.png'),
    Grooming: {
      ...breed.Grooming,
      imageUrl: buildServiceImageUrl(BREED_SERVICE_IMAGES.Grooming),
    },
    Bathing: {
      ...breed.Bathing,
      imageUrl: buildServiceImageUrl(BREED_SERVICE_IMAGES.Bathing),
    },
    GroomingAndBathing: {
      ...breed.GroomingAndBathing,
      imageUrl: buildServiceImageUrl(BREED_SERVICE_IMAGES.GroomingAndBathing),
    },
  };
}

export interface TenantMeta {
  ClientID: string;
  RegionId: string;
  StoreId: string;
}

export function getGroomersData() {
  return readJsonFile<TenantMeta & { Groomers: unknown[]; Bathers: unknown[] }>('groomers.json');
}

export function getHolidaysData() {
  return readJsonFile<TenantMeta & { HolidayList: unknown[] }>('holidays.json');
}

export function getServiceHoursData() {
  return readJsonFile<TenantMeta & { HolidayList: unknown[] }>('service-hours.json');
}

export function getServicesAndPackagesData() {
  const data = readJsonFile<
    TenantMeta & {
      Breeds: ServicesPackagesBreed[];
      Packages: ServicesPackagesPackage[];
      AddOns: ServicesPackagesAddOn[];
      'Walk In Services': ServicesPackagesWalkIn[];
    }
  >('service&packages.json');

  return {
    ...data,
    Breeds: (data.Breeds || []).map((breed) => enrichBreedServices(breed)),
    Packages: (data.Packages || []).map((pkg) => ({
      ...pkg,
      imageUrl: buildServiceImageUrl('svc_full_grooming.png'),
    })),
    AddOns: (data.AddOns || []).map((addOn) => enrichNamedItem(addOn)),
    'Walk In Services': (data['Walk In Services'] || []).map((service) => enrichNamedItem(service)),
  };
}

export function getBreedsData() {
  return readJsonFile<TenantMeta & { breeds: unknown[] }>('breeds.json');
}

export function getPetWeightsData() {
  return readJsonFile<TenantMeta & { petWeights: unknown[] }>('pet-weights.json');
}
