import type { NextFunction, Request, Response } from 'express';
import { AppointmentStatus } from '@prisma/client';
import { DateTime } from 'luxon';
import { z } from 'zod';
import { prisma } from '../../utils/prisma.js';
import { canTransitionAppointment } from '../../domain/appointment-status.js';
import { requireTenant } from '../../middleware/tenant-context.js';
import { badRequest, conflict, notFound } from '../../shared/errors.js';
import { recordAudit } from '../audit/audit-service.js';
import { appointmentInclude, toAppointmentDto } from '../appointments/appointment-dto.js';
import { listPublicBarbers } from '../catalog/catalog-service.js';

const listSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  barberId: z.string().uuid().optional(),
  status: z.string().transform((value) => value.toUpperCase()).pipe(z.nativeEnum(AppointmentStatus)).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(50),
});

const updateSchema = z.object({
  status: z.string().transform((value) => value.toUpperCase()).pipe(z.nativeEnum(AppointmentStatus)).optional(),
  notes: z.string().trim().max(1000).nullable().optional(),
}).refine((value) => value.status !== undefined || value.notes !== undefined, 'No hay cambios para guardar');

export async function listAppointments(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = requireTenant(req);
    const query = listSchema.parse(req.query);
    const dateRange = query.date
      ? {
          gte: DateTime.fromISO(query.date, { zone: tenant.timezone }).startOf('day').toUTC().toJSDate(),
          lte: DateTime.fromISO(query.date, { zone: tenant.timezone }).endOf('day').toUTC().toJSDate(),
        }
      : undefined;
    const where = {
      tenantId: tenant.id,
      ...(query.barberId ? { barberId: query.barberId } : {}),
      ...(query.status ? { status: query.status } : {}),
      ...(dateRange ? { startsAt: dateRange } : {}),
    };
    const [items, total] = await prisma.$transaction([
      prisma.appointment.findMany({
        where,
        include: appointmentInclude,
        orderBy: { startsAt: 'asc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.appointment.count({ where }),
    ]);
    res.json({
      items: items.map((item) => toAppointmentDto(item, tenant.timezone)),
      pagination: { page: query.page, pageSize: query.pageSize, total, pages: Math.ceil(total / query.pageSize) },
    });
  } catch (error) {
    next(error);
  }
}

export async function getAppointment(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = requireTenant(req);
    const appointment = await prisma.appointment.findFirst({
      where: { id: req.params.id as string, tenantId: tenant.id },
      include: appointmentInclude,
    });
    if (!appointment) throw notFound('Cita');
    res.json(toAppointmentDto(appointment, tenant.timezone));
  } catch (error) {
    next(error);
  }
}

export async function updateAppointment(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = requireTenant(req);
    const input = updateSchema.parse(req.body);
    const existing = await prisma.appointment.findFirst({
      where: { id: req.params.id as string, tenantId: tenant.id },
      select: { id: true, status: true },
    });
    if (!existing) throw notFound('Cita');
    if (input.status && !canTransitionAppointment(existing.status, input.status)) {
      throw conflict('INVALID_STATUS_TRANSITION', `No se puede cambiar una cita de ${existing.status} a ${input.status}`);
    }

    const updated = await prisma.appointment.update({
      where: { id: existing.id, tenantId: tenant.id },
      data: {
        ...(input.notes !== undefined ? { notes: input.notes } : {}),
        ...(input.status && input.status !== existing.status
          ? {
              status: input.status,
              version: { increment: 1 },
              statusHistory: { create: { fromStatus: existing.status, toStatus: input.status, changedById: req.auth?.userId } },
            }
          : {}),
      },
      include: appointmentInclude,
    });
    await recordAudit(req, {
      action: 'appointment.update', resourceType: 'appointment', resourceId: existing.id, result: 'SUCCESS',
      context: { status: input.status },
    });
    res.json(toAppointmentDto(updated, tenant.timezone));
  } catch (error) {
    next(error);
  }
}

export async function cancelAppointment(req: Request, res: Response, next: NextFunction) {
  req.body = { status: 'CANCELLED', notes: req.body?.notes };
  return updateAppointment(req, res, next);
}

export async function listBarbers(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await listPublicBarbers(requireTenant(req).id));
  } catch (error) {
    next(error);
  }
}

export function validateAppointmentId(req: Request, _res: Response, next: NextFunction) {
  try {
    if (!z.string().uuid().safeParse(req.params.id).success) throw badRequest('INVALID_ID', 'Identificador inválido');
    next();
  } catch (error) {
    next(error);
  }
}
