import { Router } from 'express';
import { z } from 'zod';
import {
  getAppointments,
  getAppointment,
  createAppointment,
  updateAppointment,
  cancelAppointment,
} from '../controllers/appointmentsController.js';
import { validateBody } from '../middleware/validation.js';

export const appointmentRoutes = Router();

const createAppointmentSchema = z.object({
  barberId: z.string().min(1, 'Barber is required'),
  serviceId: z.string().min(1, 'Service is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:MM'),
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string().min(7, 'Phone must be at least 7 characters'),
  notes: z.string().optional(),
});

const updateAppointmentSchema = z.object({
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  serviceId: z.string().optional(),
  status: z.enum(['confirmed', 'pending', 'cancelled', 'completed']).optional(),
  notes: z.string().optional(),
});

appointmentRoutes.get('/', getAppointments);
appointmentRoutes.get('/:id', getAppointment);
appointmentRoutes.post('/', validateBody(createAppointmentSchema), createAppointment);
appointmentRoutes.put('/:id', validateBody(updateAppointmentSchema), updateAppointment);
appointmentRoutes.delete('/:id', cancelAppointment);
