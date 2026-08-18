export const DAYS_OF_WEEK = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
] as const;

export const DEFAULT_TENANT = {
  clientId: 'SHEAR-001',
  regionId: 'DWG-001',
  storeId: 'SHEAR-001',
};

export type TenantInput = {
  ClientID?: string;
  RegionId?: string;
  StoreId?: string;
  clientId?: string;
  regionId?: string;
  storeId?: string;
};

export function resolveTenant(input: TenantInput = {}) {
  return {
    clientId: input.ClientID || input.clientId || DEFAULT_TENANT.clientId,
    regionId: input.RegionId || input.regionId || DEFAULT_TENANT.regionId,
    storeId: input.StoreId || input.storeId || DEFAULT_TENANT.storeId,
  };
}

export function tenantWhere(input: TenantInput = {}) {
  return resolveTenant(input);
}

export function timeToMinutes(time: string): number {
  if (!time) return 0;
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function dayNameFromDate(date: string): string {
  return DAYS_OF_WEEK[new Date(`${date}T00:00:00`).getDay()];
}
