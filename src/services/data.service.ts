import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '..', 'data');

function readJsonFile<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content) as T;
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
  return readJsonFile<
    TenantMeta & {
      Breeds: unknown[];
      Packages: unknown[];
      AddOns: unknown[];
      'Walk In Services': unknown[];
    }
  >('service&packages.json');
}

export function getBreedsData() {
  return readJsonFile<TenantMeta & { breeds: unknown[] }>('breeds.json');
}

export function getPetWeightsData() {
  return readJsonFile<TenantMeta & { petWeights: unknown[] }>('pet-weights.json');
}
