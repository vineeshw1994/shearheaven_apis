import { Request, Response, NextFunction } from 'express';
import * as dataService from '../services/data.service';
import { sendSuccess } from '../utils/response';

export function getGroomers(_req: Request, res: Response, next: NextFunction): void {
  try {
    const data = dataService.getGroomersData();
    sendSuccess(res, 'Request successful', data);
  } catch (error) {
    next(error);
  }
}

export function getHolidays(_req: Request, res: Response, next: NextFunction): void {
  try {
    const data = dataService.getHolidaysData();
    sendSuccess(res, 'Request successful', data);
  } catch (error) {
    next(error);
  }
}

export function getServiceHours(_req: Request, res: Response, next: NextFunction): void {
  try {
    const data = dataService.getServiceHoursData();
    sendSuccess(res, 'Request successful', data);
  } catch (error) {
    next(error);
  }
}

export function getBreeds(_req: Request, res: Response, next: NextFunction): void {
  try {
    const data = dataService.getBreedsData();
    sendSuccess(res, 'Request successful', data);
  } catch (error) {
    next(error);
  }
}

export function getPetWeights(_req: Request, res: Response, next: NextFunction): void {
  try {
    const data = dataService.getPetWeightsData();
    sendSuccess(res, 'Request successful', data);
  } catch (error) {
    next(error);
  }
}

export function getServicesAndPackages(_req: Request, res: Response, next: NextFunction): void {
  try {
    const data = dataService.getServicesAndPackagesData();
    sendSuccess(res, 'Request successful', data);
  } catch (error) {
    next(error);
  }
}
