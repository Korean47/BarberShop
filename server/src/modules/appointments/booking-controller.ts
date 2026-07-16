import type { NextFunction, Request, Response } from 'express';
import { requireTenant } from '../../middleware/tenant-context.js';
import { badRequest } from '../../shared/errors.js';
import { createBooking, getManagedAppointment, manageAppointment } from './booking-service.js';
import type { CreateBookingInput, ManageAppointmentInput } from './booking-schemas.js';

function managementToken(req: Request) {
  const token = req.header('x-appointment-token');
  if (!token) throw badRequest('TOKEN_REQUIRED', 'El enlace de la cita no es válido');
  return token;
}

export async function create(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = requireTenant(req);
    const result = await createBooking(tenant, req.body as CreateBookingInput);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getManaged(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = requireTenant(req);
    res.json(await getManagedAppointment(tenant.id, tenant.timezone, managementToken(req)));
  } catch (error) {
    next(error);
  }
}

export async function updateManaged(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = requireTenant(req);
    res.json(await manageAppointment(tenant, managementToken(req), req.body as ManageAppointmentInput));
  } catch (error) {
    next(error);
  }
}

export { managementToken };
