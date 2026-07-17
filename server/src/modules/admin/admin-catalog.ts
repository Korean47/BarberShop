import type { NextFunction, Request, Response } from 'express';
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
});

const idSchema = z.string().uuid();

export async function listCatalog(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = requireTenant(req);
    const [categories, services, barbers] = await Promise.all([
      prisma.serviceCategory.findMany({ where: { tenantId: tenant.id }, orderBy: { sortOrder: 'asc' } }),
      prisma.service.findMany({
        where: { tenantId: tenant.id },
        include: { category: true, barbers: { select: { barberId: true } } },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      }),
      prisma.barberProfile.findMany({
        where: { tenantId: tenant.id },
        include: { services: { select: { serviceId: true } } },
        orderBy: { displayName: 'asc' },
      }),
    ]);
    res.json({
      categories,
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
    const { serviceIds, email, phone, photoUrl, bio, ...data } = input;
    const barber = await prisma.barberProfile.create({
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
    const { serviceIds, email, phone, photoUrl, bio, ...data } = input;
    const barber = await prisma.barberProfile.update({
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
    await recordAudit(req, { action: 'barber.update', resourceType: 'barber', resourceId: barber.id, result: 'SUCCESS' });
    res.json(barber);
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
