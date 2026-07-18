import type { NextFunction, Request, Response } from 'express';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';
import { requireTenant } from '../../middleware/tenant-context.js';
import { badRequest, notFound } from '../../shared/errors.js';
import { prisma } from '../../utils/prisma.js';
import { recordAudit } from '../audit/audit-service.js';

const serviceInput = z.object({
  name: z.string().trim().min(2).max(140),
  description: z.string().trim().max(500),
  imageUrl: z.string().trim().max(500).nullable().or(z.literal('')),
  durationMinutes: z.number().int().min(10).max(240),
  priceCents: z.number().int().min(0).max(1_000_000),
  priceType: z.enum(['FIXED', 'STARTING_AT', 'ESTIMATE', 'CONFIRM']),
  categoryId: z.string().uuid(),
  isActive: z.boolean(),
  sortOrder: z.number().int().min(0).max(10_000),
  barberIds: z.array(z.string().uuid()).max(100),
});

const barberInput = z.object({
  displayName: z.string().trim().min(2).max(160),
  email: z.string().trim().email().max(254).nullable().or(z.literal('')),
  phone: z.string().trim().max(32).nullable().or(z.literal('')),
  photoUrl: z.string().trim().max(500).nullable().or(z.literal('')),
  bio: z.string().trim().max(1000).nullable().or(z.literal('')),
  isActive: z.boolean(),
  serviceIds: z.array(z.string().uuid()).max(100),
  schedules: z.array(z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    startMinute: z.number().int().min(0).max(1439),
    endMinute: z.number().int().min(1).max(1440),
    isWorking: z.boolean(),
    breaks: z.array(z.object({
      startMinute: z.number().int().min(0).max(1439),
      endMinute: z.number().int().min(1).max(1440),
      label: z.string().trim().max(100).nullable().or(z.literal('')),
    }).refine((value) => value.endMinute > value.startMinute, 'El descanso debe terminar después de comenzar')).max(8),
  }).refine((value) => !value.isWorking || value.endMinute > value.startMinute, 'El turno debe terminar después de comenzar')).max(7),
  timeOff: z.array(z.object({
    startsAt: z.coerce.date(),
    endsAt: z.coerce.date(),
    reason: z.string().trim().max(200).nullable().or(z.literal('')),
  }).refine((value) => value.endsAt > value.startsAt, 'La ausencia debe terminar después de comenzar')).max(100),
}).superRefine((value, context) => {
  if (new Set(value.schedules.map(({ dayOfWeek }) => dayOfWeek)).size !== value.schedules.length) {
    context.addIssue({ code: 'custom', path: ['schedules'], message: 'No repitas días de trabajo' });
  }
  value.schedules.forEach((schedule, scheduleIndex) => {
    const orderedBreaks = [...schedule.breaks].sort((left, right) => left.startMinute - right.startMinute);
    orderedBreaks.forEach((item, breakIndex) => {
      if (schedule.isWorking && (item.startMinute < schedule.startMinute || item.endMinute > schedule.endMinute)) {
        context.addIssue({ code: 'custom', path: ['schedules', scheduleIndex, 'breaks', breakIndex], message: 'El descanso debe quedar dentro del turno' });
      }
      if (breakIndex > 0 && item.startMinute < orderedBreaks[breakIndex - 1].endMinute) {
        context.addIssue({ code: 'custom', path: ['schedules', scheduleIndex, 'breaks'], message: 'Los descansos no pueden traslaparse' });
      }
    });
  });
});

const categoryInput = z.object({
  name: z.string().trim().min(2).max(120),
  sortOrder: z.number().int().min(0).max(10_000),
  isActive: z.boolean(),
});

const idSchema = z.string().uuid();

export async function listCatalog(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = requireTenant(req);
    const defaultLocation = await prisma.location.findFirst({
      where: { tenantId: tenant.id, isActive: true },
      orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
      include: { businessSchedules: { orderBy: { dayOfWeek: 'asc' } } },
    });
    if (!defaultLocation) throw badRequest('LOCATION_REQUIRED', 'Configura una sucursal antes de administrar el catálogo');
    const [categories, services, barbers] = await Promise.all([
      prisma.serviceCategory.findMany({ where: { tenantId: tenant.id }, orderBy: { sortOrder: 'asc' } }),
      prisma.service.findMany({
        where: { tenantId: tenant.id },
        include: { category: true, barbers: { select: { barberId: true } } },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      }),
      prisma.barberProfile.findMany({
        where: { tenantId: tenant.id },
        include: {
          services: { select: { serviceId: true } },
          schedules: { where: { locationId: defaultLocation.id }, include: { breaks: { orderBy: { startMinute: 'asc' } } }, orderBy: { dayOfWeek: 'asc' } },
          timeOff: { where: { endsAt: { gt: new Date() } }, orderBy: { startsAt: 'asc' } },
        },
        orderBy: { displayName: 'asc' },
      }),
    ]);
    res.json({
      categories,
      defaultLocation: { id: defaultLocation.id, name: defaultLocation.name, businessSchedules: defaultLocation.businessSchedules },
      services: services.map((service) => ({ ...service, barberIds: service.barbers.map(({ barberId }) => barberId) })),
      barbers: barbers.map((barber) => ({ ...barber, serviceIds: barber.services.map(({ serviceId }) => serviceId) })),
    });
  } catch (error) {
    next(error);
  }
}

export async function createService(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = requireTenant(req);
    const input = serviceInput.parse(req.body);
    await assertCatalogReferences(tenant.id, input.categoryId, input.barberIds);
    const { barberIds, imageUrl, ...data } = input;
    const service = await prisma.service.create({
      data: {
        tenantId: tenant.id,
        ...data,
        imageUrl: imageUrl || null,
        barbers: { create: barberIds.map((barberId) => ({ barberId })) },
      },
    });
    await recordAudit(req, { action: 'service.create', resourceType: 'service', resourceId: service.id, result: 'SUCCESS' });
    res.status(201).json(service);
  } catch (error) {
    next(error);
  }
}

export async function updateService(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = requireTenant(req);
    const id = idSchema.parse(req.params.id);
    const input = serviceInput.parse(req.body);
    const existing = await prisma.service.findFirst({ where: { id, tenantId: tenant.id }, select: { id: true } });
    if (!existing) throw notFound('Servicio');
    await assertCatalogReferences(tenant.id, input.categoryId, input.barberIds);
    const { barberIds, imageUrl, ...data } = input;
    const service = await prisma.service.update({
      where: { id },
      data: {
        ...data,
        imageUrl: imageUrl || null,
        barbers: { deleteMany: {}, create: barberIds.map((barberId) => ({ barberId })) },
      },
    });
    await recordAudit(req, { action: 'service.update', resourceType: 'service', resourceId: service.id, result: 'SUCCESS' });
    res.json(service);
  } catch (error) {
    next(error);
  }
}

export async function createBarber(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = requireTenant(req);
    const input = barberInput.parse(req.body);
    await assertServices(tenant.id, input.serviceIds);
    const locationId = await getDefaultLocationId(tenant.id);
    const { serviceIds, schedules, timeOff, email, phone, photoUrl, bio, ...data } = input;
    const barber = await prisma.$transaction(async (tx) => {
      const created = await tx.barberProfile.create({
        data: {
          tenantId: tenant.id,
          ...data,
          email: email || null,
          phone: phone || null,
          photoUrl: photoUrl || null,
          bio: bio || null,
          services: { create: serviceIds.map((serviceId) => ({ serviceId })) },
        },
      });
      await replaceBarberAvailability(tx, created.id, locationId, schedules, timeOff);
      return created;
    });
    await recordAudit(req, { action: 'barber.create', resourceType: 'barber', resourceId: barber.id, result: 'SUCCESS' });
    res.status(201).json(barber);
  } catch (error) {
    next(error);
  }
}

export async function updateBarber(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = requireTenant(req);
    const id = idSchema.parse(req.params.id);
    const input = barberInput.parse(req.body);
    const existing = await prisma.barberProfile.findFirst({ where: { id, tenantId: tenant.id }, select: { id: true } });
    if (!existing) throw notFound('Barbero');
    await assertServices(tenant.id, input.serviceIds);
    const locationId = await getDefaultLocationId(tenant.id);
    const { serviceIds, schedules, timeOff, email, phone, photoUrl, bio, ...data } = input;
    const barber = await prisma.$transaction(async (tx) => {
      const updated = await tx.barberProfile.update({
        where: { id },
        data: {
          ...data,
          email: email || null,
          phone: phone || null,
          photoUrl: photoUrl || null,
          bio: bio || null,
          services: { deleteMany: {}, create: serviceIds.map((serviceId) => ({ serviceId })) },
        },
      });
      await replaceBarberAvailability(tx, id, locationId, schedules, timeOff);
      return updated;
    });
    await recordAudit(req, { action: 'barber.update', resourceType: 'barber', resourceId: barber.id, result: 'SUCCESS' });
    res.json(barber);
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = requireTenant(req);
    const input = categoryInput.parse(req.body);
    const category = await prisma.serviceCategory.create({ data: { tenantId: tenant.id, ...input } });
    await recordAudit(req, { action: 'category.create', resourceType: 'service_category', resourceId: category.id, result: 'SUCCESS' });
    res.status(201).json(category);
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = requireTenant(req);
    const id = idSchema.parse(req.params.id);
    const input = categoryInput.parse(req.body);
    const existing = await prisma.serviceCategory.findFirst({ where: { id, tenantId: tenant.id }, select: { id: true } });
    if (!existing) throw notFound('Categoría');
    const category = await prisma.serviceCategory.update({ where: { id }, data: input });
    await recordAudit(req, { action: 'category.update', resourceType: 'service_category', resourceId: category.id, result: 'SUCCESS' });
    res.json(category);
  } catch (error) {
    next(error);
  }
}

async function assertCatalogReferences(tenantId: string, categoryId: string, barberIds: string[]) {
  const [category, barbers] = await Promise.all([
    prisma.serviceCategory.findFirst({ where: { id: categoryId, tenantId }, select: { id: true } }),
    prisma.barberProfile.count({ where: { id: { in: barberIds }, tenantId } }),
  ]);
  if (!category) throw badRequest('INVALID_CATEGORY', 'La categoría no pertenece a esta barbería');
  if (barbers !== new Set(barberIds).size) throw badRequest('INVALID_BARBER', 'Uno de los barberos no pertenece a esta barbería');
}

async function assertServices(tenantId: string, serviceIds: string[]) {
  const count = await prisma.service.count({ where: { id: { in: serviceIds }, tenantId } });
  if (count !== new Set(serviceIds).size) throw badRequest('INVALID_SERVICE', 'Uno de los servicios no pertenece a esta barbería');
}

async function getDefaultLocationId(tenantId: string) {
  const location = await prisma.location.findFirst({ where: { tenantId, isActive: true }, orderBy: [{ isDefault: 'desc' }, { name: 'asc' }], select: { id: true } });
  if (!location) throw badRequest('LOCATION_REQUIRED', 'Configura una sucursal antes de administrar horarios');
  return location.id;
}

async function replaceBarberAvailability(
  tx: Prisma.TransactionClient,
  barberId: string,
  locationId: string,
  schedules: z.infer<typeof barberInput>['schedules'],
  timeOff: z.infer<typeof barberInput>['timeOff'],
) {
  await tx.barberSchedule.deleteMany({ where: { barberId, locationId } });
  for (const schedule of schedules) {
    const { breaks, ...data } = schedule;
    await tx.barberSchedule.create({
      data: {
        barberId,
        locationId,
        ...data,
        breaks: { create: breaks.map((item) => ({ ...item, label: item.label || null })) },
      },
    });
  }
  await tx.timeOff.deleteMany({ where: { barberId, endsAt: { gt: new Date() } } });
  if (timeOff.length) {
    await tx.timeOff.createMany({ data: timeOff.map((item) => ({ barberId, startsAt: item.startsAt, endsAt: item.endsAt, reason: item.reason || null })) });
  }
}
