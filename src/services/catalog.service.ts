import { getGroomersData, getHolidaysData, getServiceHoursData, getServicesAndPackagesData } from './data.service';
import { NotFoundError } from '../utils/response';

export interface CatalogItem {
  id: number;
  name: string;
  price: number;
  durationMinutes: number;
  code?: string;
}

export interface CatalogGroomer {
  id: number;
  code: string;
  firstName: string;
  lastName: string;
  name: string;
  role: string;
  type: 'Groomer' | 'Bather';
}

export interface WorkingHours {
  day: string;
  open: string;
  close: string;
  closed: boolean;
}

interface BreedService {
  Price: string;
  TimeinMinutes: string;
}

interface BreedRecord {
  BreedTypeId: string;
  BreedType: string;
  Grooming: BreedService;
  Bathing: BreedService;
  GroomingAndBathing: BreedService;
}

interface PackageRecord {
  PackageId?: string;
  PackageName: string;
  TimeinMinutes: string;
  Price: string;
}

interface AddOnRecord {
  AddOnId: string;
  Name: string;
  Price: string;
  TimeinMinutes: string;
}

interface WalkInRecord {
  WalkInServiceId: string;
  Name: string;
  TimeinMinutes: string;
  Price: string;
}

interface ServiceHoursDay {
  Day: string;
  Open: string;
  Start: string;
  End: string;
}

interface HolidayRecord {
  HolidayId: string;
  Name: string;
  Date: string;
  Description: string;
}

const DAY_ALIASES: Record<string, number> = {
  sunday: 0,
  sumday: 0,
  monday: 1,
  tuesday: 2,
  tueday: 2,
  wednesday: 3,
  thursday: 4,
  friday: 5,
  saturday: 6,
};

export function parsePrice(value: string | number): number {
  const numeric = String(value).replace(/[^0-9.]/g, '');
  return numeric ? parseFloat(numeric) : 0;
}

export function parseDuration(value: string | number): number {
  const text = String(value).trim();
  if (!text || /^not applicable$/i.test(text)) {
    return 15;
  }
  const minutes = parseInt(text, 10);
  return Number.isNaN(minutes) ? 0 : minutes;
}

export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map((part) => parseInt(part, 10));
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function normalizeCloseTime(open: string, close: string): string {
  if (!open || !close) {
    return close;
  }
  const openMinutes = timeToMinutes(open);
  let closeMinutes = timeToMinutes(close);
  if (closeMinutes <= openMinutes) {
    closeMinutes += 12 * 60;
  }
  return minutesToTime(closeMinutes);
}

function getCatalogPayload() {
  return getServicesAndPackagesData() as {
    Breeds: BreedRecord[];
    Packages: PackageRecord[];
    AddOns: AddOnRecord[];
    'Walk In Services': WalkInRecord[];
  };
}

export function getServices(): CatalogItem[] {
  const data = getCatalogPayload();
  const services: CatalogItem[] = [];
  let id = 1;

  for (const breed of data.Breeds || []) {
    const entries: Array<[string, BreedService]> = [
      ['Grooming', breed.Grooming],
      ['Bathing', breed.Bathing],
      ['Grooming and Bathing', breed.GroomingAndBathing],
    ];

    for (const [serviceName, service] of entries) {
      if (!service) continue;
      services.push({
        id: id++,
        name: `${breed.BreedType} - ${serviceName}`,
        code: `${breed.BreedTypeId}-${serviceName.replace(/\s+/g, '')}`,
        price: parsePrice(service.Price),
        durationMinutes: parseDuration(service.TimeinMinutes),
      });
    }
  }

  for (const walkIn of data['Walk In Services'] || []) {
    services.push({
      id: id++,
      name: walkIn.Name,
      code: walkIn.WalkInServiceId,
      price: parsePrice(walkIn.Price),
      durationMinutes: parseDuration(walkIn.TimeinMinutes),
    });
  }

  return services;
}

export function getPackages(): CatalogItem[] {
  const data = getCatalogPayload();
  return (data.Packages || []).map((pkg, index) => ({
    id: index + 1,
    name: pkg.PackageName || pkg.PackageId || `Package ${index + 1}`,
    code: pkg.PackageId || `P${String(index + 1).padStart(4, '0')}`,
    price: parsePrice(pkg.Price),
    durationMinutes: parseDuration(pkg.TimeinMinutes),
  }));
}

export function getAddOns(): CatalogItem[] {
  const data = getCatalogPayload();
  return (data.AddOns || []).map((addOn, index) => ({
    id: index + 1,
    name: addOn.Name,
    code: addOn.AddOnId,
    price: parsePrice(addOn.Price),
    durationMinutes: parseDuration(addOn.TimeinMinutes),
  }));
}

export function getCatalogGroomers(): CatalogGroomer[] {
  const data = getGroomersData() as {
    Groomers: Array<{ GroomerId: string; FirstName: string; LastName: string; Role: string }>;
    Bathers: Array<{ BatherId: string; FirstName: string; LastName: string; Role: string }>;
  };

  const groomers: CatalogGroomer[] = [];
  let id = 1;

  for (const groomer of data.Groomers || []) {
    groomers.push({
      id: id++,
      code: groomer.GroomerId,
      firstName: groomer.FirstName,
      lastName: groomer.LastName,
      name: `${groomer.FirstName} ${groomer.LastName}`.trim(),
      role: groomer.Role,
      type: 'Groomer',
    });
  }

  for (const bather of data.Bathers || []) {
    groomers.push({
      id: id++,
      code: bather.BatherId,
      firstName: bather.FirstName,
      lastName: bather.LastName,
      name: `${bather.FirstName} ${bather.LastName}`.trim(),
      role: bather.Role,
      type: 'Bather',
    });
  }

  return groomers;
}

export function getServiceById(id: number): CatalogItem {
  const service = getServices().find((item) => item.id === id);
  if (!service) {
    throw new NotFoundError(`Service ${id} not found`);
  }
  return service;
}

export function getPackageById(id: number): CatalogItem {
  const pkg = getPackages().find((item) => item.id === id);
  if (!pkg) {
    throw new NotFoundError(`Package ${id} not found`);
  }
  return pkg;
}

export function getAddOnById(id: number): CatalogItem {
  const addOn = getAddOns().find((item) => item.id === id);
  if (!addOn) {
    throw new NotFoundError(`Add-on ${id} not found`);
  }
  return addOn;
}

export function getGroomerById(id: number): CatalogGroomer {
  const groomer = getCatalogGroomers().find((item) => item.id === id);
  if (!groomer) {
    throw new NotFoundError(`Groomer ${id} not found`);
  }
  return groomer;
}

export function getDefaultGroomer(): CatalogGroomer {
  const groomers = getCatalogGroomers();
  if (groomers.length === 0) {
    throw new NotFoundError('No groomers are available');
  }
  return groomers[0];
}

export function getWorkingHoursForDate(date: string): WorkingHours {
  const data = getServiceHoursData() as { HolidayList: ServiceHoursDay[] };
  const jsDay = new Date(`${date}T00:00:00`).getDay();
  const match = (data.HolidayList || []).find((entry) => DAY_ALIASES[entry.Day.toLowerCase()] === jsDay);

  if (!match || match.Open.toLowerCase() !== 'yes') {
    return {
      day: match?.Day || '',
      open: '',
      close: '',
      closed: true,
    };
  }

  return {
    day: match.Day,
    open: match.Start,
    close: normalizeCloseTime(match.Start, match.End),
    closed: false,
  };
}

export function getHolidayOnDate(date: string): HolidayRecord | null {
  const data = getHolidaysData() as { HolidayList: HolidayRecord[] };

  return (
    (data.HolidayList || []).find((holiday) => {
      const [month, day, year] = holiday.Date.split('/').map((part) => part.padStart(2, '0'));
      return `${year}-${month}-${day}` === date;
    }) || null
  );
}

export function calculateQuote(serviceId: number, packageId?: number | null, addOnIds: number[] = []) {
  const service = getServiceById(serviceId);
  const selectedPackage = packageId ? getPackageById(packageId) : null;
  const selectedAddOns = addOnIds.map((id) => getAddOnById(id));

  const totalDurationMinutes = service.durationMinutes;

  const totalPrice =
    service.price +
    (selectedPackage?.price || 0) +
    selectedAddOns.reduce((sum, addOn) => sum + addOn.price, 0);

  return {
    service,
    package: selectedPackage,
    addOns: selectedAddOns,
    totalDurationMinutes,
    totalPrice: Number(totalPrice.toFixed(2)),
  };
}
