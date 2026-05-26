import { Request, Response, NextFunction } from 'express';
import * as serviceService from '../services/serviceService.js';

export async function getServices(req: Request, res: Response, next: NextFunction) {
  try {
    const services = await serviceService.listServices();
    res.json(services);
  } catch (err) {
    next(err);
  }
}

export async function getService(req: Request, res: Response, next: NextFunction) {
  try {
    const service = await serviceService.getServiceById(req.params.id as string);
    res.json(service);
  } catch (err) {
    next(err);
  }
}
