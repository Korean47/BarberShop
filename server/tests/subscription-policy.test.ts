import { describe, expect, it } from 'vitest';
import { evaluateSubscriptionAccess } from '../src/modules/subscriptions/subscription-policy.js';

describe('subscription access policy', () => {
  const now = new Date('2026-07-15T12:00:00.000Z');

  it.each(['ACTIVE', 'TRIAL'] as const)('allows %s subscriptions', (subscriptionStatus) => {
    expect(evaluateSubscriptionAccess({ tenantStatus: 'ACTIVE', subscriptionStatus, graceEndsAt: null, now })).toEqual({
      allowed: true,
      mode: 'normal',
    });
  });

  it('allows an unexpired grace period and blocks an expired one', () => {
    expect(evaluateSubscriptionAccess({
      tenantStatus: 'ACTIVE', subscriptionStatus: 'GRACE', graceEndsAt: new Date('2026-07-16T00:00:00Z'), now,
    }).allowed).toBe(true);
    expect(evaluateSubscriptionAccess({
      tenantStatus: 'ACTIVE', subscriptionStatus: 'GRACE', graceEndsAt: new Date('2026-07-14T00:00:00Z'), now,
    }).allowed).toBe(false);
  });

  it.each(['PAST_DUE', 'SUSPENDED', 'CANCELLED', 'EXPIRED'] as const)('blocks %s on the backend', (subscriptionStatus) => {
    expect(evaluateSubscriptionAccess({ tenantStatus: 'ACTIVE', subscriptionStatus, graceEndsAt: null, now }).allowed).toBe(false);
  });

  it('blocks a suspended tenant even when billing is active', () => {
    expect(evaluateSubscriptionAccess({ tenantStatus: 'SUSPENDED', subscriptionStatus: 'ACTIVE', graceEndsAt: null, now })).toEqual({
      allowed: false,
      reason: 'tenant_suspended',
    });
  });
});
