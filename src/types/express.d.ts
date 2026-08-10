import { Request } from 'express';

export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  mobile: string;
  emailVerified: boolean;
  clientId: string;
  regionId: string;
  storeId: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export interface TenantFields {
  clientId: string;
  regionId: string;
  storeId: string;
}
