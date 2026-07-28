import type { NextFunction, Request, Response } from 'express';
import { forbidden } from '../shared/errors.js';
import { requireTenant } from './tenant-context.js';
import { evaluateSubscriptionAccess } from '../modules/subscriptions/subscription-policy.js';

export function requireOperationalSubscription(req: Request, _res: Response, next: NextFunction) {
  try {
    const tenant = requireTenant(req);
    const access = evaluateSubscriptionAccess({
      tenantStatus: tenant.status,
      subscriptionStatus: tenant.subscriptionStatus,
      graceEndsAt: tenant.graceEndsAt,
    });

    if (!access.allowed) {
      throw forbidden(
        'SUBSCRIPTION_REQUIRED',
        'La agenda está pausada temporalmente. El propietario puede reactivarla desde Facturación.',
      );
    }
    next();
  } catch (error) {
    next(error);
  }
}
