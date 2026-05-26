import type { Request, Response, NextFunction } from 'express';
import * as barberService from '../services/barberService.js';
import * as availabilityService from '../services/availabilityService.js';
import { AppError } from '../middleware/errorHandler.js';

export async function getBarbers(_req: Request, res: Response, next: NextFunction) {
  try {
    const barbers = await barberService.getAllBarbers();
    res.json(barbers);
  } catch (err) {
    next(err);
  }
}

export async function getBarber(req: Request, res: Response, next: NextFunction) {
  try {
    const barber = await barberService.getBarberById(req.params.id as string);
    if (!barber) throw new AppError(404, 'Barber not found');
    res.json(barber);
  } catch (err) {
    next(err);
  }
}

export async function getBarberAvailability(req: Request, res: Response, next: NextFunction) {
  try {
    const { id } = req.params;
    const { date, duration } = req.query;

    if (!date || typeof date !== 'string') {
      res.status(400).json({ error: 'Date query parameter is required and must be a string' });
      return;
    }

    const serviceDuration = duration ? parseInt(duration as string, 10) : 30;
    const availability = await availabilityService.getAvailability(id as string, date, serviceDuration);
    res.json(availability);
  } catch (err) {
    next(err);
  }
}
