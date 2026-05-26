import type { Request, Response, NextFunction } from 'express';
import * as appointmentService from '../services/appointmentService.js';

export async function getAppointments(req: Request, res: Response, next: NextFunction) {
  try {
    const { date, barberId, status } = req.query;
    const appointments = await appointmentService.listAppointments({
      date: date as string | undefined,
      barberId: barberId as string | undefined,
      status: status as string | undefined,
    });
    res.json(appointments);
  } catch (err) {
    next(err);
  }
}

export async function getAppointment(req: Request, res: Response, next: NextFunction) {
  try {
    const appointment = await appointmentService.getAppointmentById(req.params.id as string);
    res.json(appointment);
  } catch (err) {
    next(err);
  }
}

export async function createAppointment(req: Request, res: Response, next: NextFunction) {
  try {
    const appointment = await appointmentService.createAppointment(req.body);
    res.status(201).json(appointment);
  } catch (err) {
    next(err);
  }
}

export async function updateAppointment(req: Request, res: Response, next: NextFunction) {
  try {
    const appointment = await appointmentService.updateAppointment(req.params.id as string, req.body);
    res.json(appointment);
  } catch (err) {
    next(err);
  }
}

export async function cancelAppointment(req: Request, res: Response, next: NextFunction) {
  try {
    const appointment = await appointmentService.cancelAppointment(req.params.id as string);
    res.json(appointment);
  } catch (err) {
    next(err);
  }
}
