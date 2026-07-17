import type { NextFunction, Request, Response } from 'express';
import { evaluateSubscriptionAccess } from '../subscriptions/subscription-policy.js';
import { requireTenant } from '../../middleware/tenant-context.js';
import { getTenantContext, listPublicBarbers, listPublicServices } from './catalog-service.js';
import { onlinePaymentsConfigured } from '../payments/provider-registry.js';

export async function tenantContext(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = requireTenant(req);
    const context = await getTenantContext(tenant.id);
    const access = evaluateSubscriptionAccess({
      tenantStatus: tenant.status,
      subscriptionStatus: tenant.subscriptionStatus,
      graceEndsAt: tenant.graceEndsAt,
    });
    const settings = Object.fromEntries(context.settings.map(({ key, value }) => [key, value]));
    const online = settings['booking.allowOnline'] === 'true' && onlinePaymentsConfigured();
    res.json({
      ...context,
      bookingAvailable: access.allowed,
      paymentOptions: {
        cash: settings['booking.allowCash'] !== 'false',
        online,
        provider: online ? 'configured' : null,
      },
      bookingRules: {
        minimumNoticeMinutes: Number(settings['booking.minimumNoticeMinutes'] ?? 120),
        maxAdvanceDays: Number(settings['booking.maxAdvanceDays'] ?? 90),
        changeCutoffHours: Number(settings['booking.cancellationHours'] ?? 2),
        holdMinutes: Number(settings['booking.holdMinutes'] ?? 30),
      },
    });
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
