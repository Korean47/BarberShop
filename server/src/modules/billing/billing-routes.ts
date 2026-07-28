import { Router } from 'express';
import type { NextFunction, Request, Response } from 'express';
import { authenticate, requireCsrf, requirePermission } from '../../middleware/auth.js';
import { requireTenant } from '../../middleware/tenant-context.js';
import { prisma } from '../../utils/prisma.js';
import { env } from '../../config/env.js';

export const billingRoutes = Router();

billingRoutes.use(authenticate);

billingRoutes.get('/', requirePermission('billing:read'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const tenant = requireTenant(req);
    const subscription = await prisma.subscription.findUnique({
      where: { tenantId: tenant.id },
      include: { plan: true, events: { orderBy: { occurredAt: 'desc' }, take: 10 } },
    });
    res.json(subscription);
  } catch (error) {
    next(error);
  }
});

billingRoutes.post(
  '/reactivation',
  requireCsrf,
  requirePermission('billing:write'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tenant = requireTenant(req);
      res.json({
        message: 'Continúa en el portal seguro para actualizar el pago',
        portalUrl: `${env.PUBLIC_APP_URL}/admin/billing?tenant=${encodeURIComponent(tenant.slug)}`,
      });
    } catch (error) {
      next(error);
    }
  },
);
