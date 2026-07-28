import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { forbidden, unauthorized } from '../shared/errors.js';
import { verifySessionToken } from '../modules/auth/token.js';

function getToken(req: Request) {
  const bearer = req.header('authorization');
  if (bearer?.startsWith('Bearer ')) return { token: bearer.slice(7), transport: 'bearer' as const };
  const cookie = req.cookies?.bs_session as string | undefined;
  if (cookie) return { token: cookie, transport: 'cookie' as const };
  throw unauthorized();
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const { token, transport } = getToken(req);
    const claims = verifySessionToken(token);
    if (!claims.sub) throw unauthorized();

    const user = await prisma.internalUser.findFirst({
      where: { id: claims.sub, isActive: true },
      include: {
        tenant: { include: { subscription: { select: { status: true, graceEndsAt: true } } } },
        roles: {
          include: {
            role: {
              include: { permissions: { include: { permission: true } } },
            },
          },
        },
      },
    });

    if (!user || user.passwordChangedAt.getTime() / 1000 > (claims.iat ?? 0)) throw unauthorized();
    if (!user.isPlatformAdmin && (!user.tenantId || user.tenantId !== claims.tenantId)) throw unauthorized();

    const permissions = user.isPlatformAdmin
      ? new Set(['*'])
      : new Set(
          user.roles.flatMap(({ role }) =>
            role.permissions.map(({ permission }) => permission.key),
          ),
        );

    req.auth = {
      userId: user.id,
      tenantId: user.tenantId,
      isPlatformAdmin: user.isPlatformAdmin,
      csrf: claims.csrf,
      transport,
      permissions,
    };

    if (user.tenant) {
      req.tenant = {
        id: user.tenant.id,
        slug: user.tenant.slug,
        name: user.tenant.name,
        timezone: user.tenant.timezone,
        currency: user.tenant.currency,
        locale: user.tenant.locale,
        status: user.tenant.status,
        subscriptionStatus: user.tenant.subscription?.status ?? null,
        graceEndsAt: user.tenant.subscription?.graceEndsAt ?? null,
      };
    }

    next();
  } catch (error) {
    next(error instanceof Error && error.name === 'JsonWebTokenError' ? unauthorized() : error);
  }
}

export function requirePermission(permission: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    try {
      if (!req.auth) throw unauthorized();
      if (!req.auth.permissions.has('*') && !req.auth.permissions.has(permission)) {
        throw forbidden();
      }
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requirePlatformAdmin(req: Request, _res: Response, next: NextFunction) {
  try {
    if (!req.auth?.isPlatformAdmin) throw forbidden();
    next();
  } catch (error) {
    next(error);
  }
}

export function requireCsrf(req: Request, _res: Response, next: NextFunction) {
  try {
    if (!req.auth) throw unauthorized();
    if (req.auth.transport === 'cookie' && req.header('x-csrf-token') !== req.auth.csrf) {
      throw forbidden('CSRF_VALIDATION_FAILED', 'La sesión cambió. Actualiza la página e inténtalo de nuevo.');
    }
    next();
  } catch (error) {
    next(error);
  }
}
