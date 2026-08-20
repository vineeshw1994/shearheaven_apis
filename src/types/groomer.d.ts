import { Request } from 'express';

export interface AuthenticatedGroomer {
  id: number;
  groomerCode: string;
  email: string;
  firstName: string;
  lastName: string;
  clientId: string;
  regionId: string;
  storeId: string;
}

export interface GroomerAuthRequest extends Request {
  groomer?: AuthenticatedGroomer;
}
