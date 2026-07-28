import type { SubscriptionStatus, TenantStatus } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      correlationId: string;
      tenant?: {
        id: string;
        slug: string;
        name: string;
        timezone: string;
        currency: string;
        locale: string;
        status: TenantStatus;
        subscriptionStatus: SubscriptionStatus | null;
        graceEndsAt: Date | null;
      };
      auth?: {
        userId: string;
        tenantId: string | null;
        isPlatformAdmin: boolean;
        csrf: string;
        transport: 'cookie' | 'bearer';
        permissions: Set<string>;
      };
    }
  }
}

export {};
