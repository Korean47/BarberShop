import type { NextFunction, Request, Response } from 'express';
import { evaluateSubscriptionAccess } from '../subscriptions/subscription-policy.js';
import { requireTenant } from '../../middleware/tenant-context.js';
import { getTenantContext, listPublicBarbers, listPublicServices } from './catalog-service.js';

export async function tenantContext(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = requireTenant(req);
    const context = await getTenantContext(tenant.id);
    const access = evaluateSubscriptionAccess({
      tenantStatus: tenant.status,
      subscriptionStatus: tenant.subscriptionStatus,
      graceEndsAt: tenant.graceEndsAt,
    });
    res.json({ ...context, bookingAvailable: access.allowed });
  } catch (error) {
    next(error);
  }
}

export async function barbers(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await listPublicBarbers(requireTenant(req).id));
  } catch (error) {
    next(error);
  }
}

export async function services(req: Request, res: Response, next: NextFunction) {
  try {
    res.json(await listPublicServices(requireTenant(req).id));
  } catch (error) {
    next(error);
  }
}
