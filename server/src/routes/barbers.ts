import { Router } from 'express';
import { getBarbers, getBarber, getBarberAvailability } from '../controllers/barbersController.js';

export const barberRoutes = Router();

barberRoutes.get('/', getBarbers);
barberRoutes.get('/:id', getBarber);
barberRoutes.get('/:id/availability', getBarberAvailability);
