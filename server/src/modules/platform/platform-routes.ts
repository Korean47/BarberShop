import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { authenticate, requireCsrf, requirePlatformAdmin } from '../../middleware/auth.js';
import { prisma } from '../../utils/prisma.js';
import { notFound } from '../../shared/errors.js';
import { recordAudit } from '../audit/audit-service.js';

export const platformRoutes = Router();
platformRoutes.use(authenticate, requirePlatformAdmin);

platformRoutes.get('/tenants', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const query = z.object({ page: z.coerce.number().int().min(1).default(1), pageSize: z.coerce.number().int().min(1).max(100).default(30) }).parse(req.query);
    const [items, total] = await prisma.$transaction([
      prisma.tenant.findMany({
        include: { subscription: { include: { plan: true } }, _count: { select: { appointments: true, users: true } } },
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize,
      }),
      prisma.tenant.count(),
    ]);
    res.json({ items, pagination: { ...query, total, pages: Math.ceil(total / query.pageSize) } });
  } catch (error) {
    next(error);
  }
});

platformRoutes.post('/tenants/:id/suspend', requireCsrf, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw notFound('Barbería');
    const updated = await prisma.tenant.update({ where: { id }, data: { status: 'SUSPENDED' } });
    await recordAudit(req, { action: 'tenant.suspend', resourceType: 'tenant', resourceId: id, result: 'SUCCESS', tenantId: id });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

platformRoutes.post('/tenants/:id/reactivate', requireCsrf, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = z.string().uuid().parse(req.params.id);
    const tenant = await prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw notFound('Barbería');
    const updated = await prisma.tenant.update({ where: { id }, data: { status: 'ACTIVE' } });
    await recordAudit(req, { action: 'tenant.reactivate', resourceType: 'tenant', resourceId: id, result: 'SUCCESS', tenantId: id });
    res.json(updated);
  } catch (error) {
    next(error);
  }
});
