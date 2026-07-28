import type { SubscriptionStatus, TenantStatus } from '@prisma/client';

export interface SubscriptionAccessInput {
  tenantStatus: TenantStatus;
  subscriptionStatus: SubscriptionStatus | null;
  graceEndsAt: Date | null;
  now?: Date;
}

export type SubscriptionAccess =
  | { allowed: true; mode: 'normal' | 'grace' }
  | { allowed: false; reason: 'tenant_suspended' | 'subscription_missing' | 'payment_required' };

export function evaluateSubscriptionAccess(input: SubscriptionAccessInput): SubscriptionAccess {
  if (input.tenantStatus !== 'ACTIVE') return { allowed: false, reason: 'tenant_suspended' };
  if (!input.subscriptionStatus) return { allowed: false, reason: 'subscription_missing' };

  if (input.subscriptionStatus === 'ACTIVE' || input.subscriptionStatus === 'TRIAL') {
    return { allowed: true, mode: 'normal' };
  }

  const now = input.now ?? new Date();
  if (
    input.subscriptionStatus === 'GRACE' &&
    input.graceEndsAt &&
    input.graceEndsAt.getTime() > now.getTime()
  ) {
    return { allowed: true, mode: 'grace' };
  }

  return { allowed: false, reason: 'payment_required' };
}
