import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../utils/prisma.js';
import { env } from '../../config/env.js';
import { randomToken } from '../../shared/crypto.js';
import { unauthorized } from '../../shared/errors.js';
import { requireTenant } from '../../middleware/tenant-context.js';
import { signSessionToken } from './token.js';
import { verifyPassword } from './password.js';
import { recordAudit } from '../audit/audit-service.js';

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  password: z.string().min(8).max(128),
});
export const platformLoginSchema = loginSchema;

const sessionCookie = {
  httpOnly: true,
  secure: env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/',
  maxAge: env.SESSION_TTL_MINUTES * 60 * 1000,
};

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = requireTenant(req);
    const { email, password } = req.body as z.infer<typeof loginSchema>;
    const user = await prisma.internalUser.findFirst({ where: { tenantId: tenant.id, email } });

    if (user?.lockedUntil && user.lockedUntil > new Date()) {
      await recordAudit(req, {
        action: 'auth.login', resourceType: 'user', resourceId: user.id, result: 'DENIED',
        context: { reason: 'locked' },
      });
      throw unauthorized('Cuenta temporalmente bloqueada. Intenta de nuevo más tarde.');
    }

    const valid = await verifyPassword(password, user?.passwordHash);
    if (!user || !valid || !user.isActive) {
      if (user) {
        const failedLoginCount = user.failedLoginCount + 1;
        await prisma.internalUser.update({
          where: { id: user.id },
          data: {
            failedLoginCount,
            lockedUntil: failedLoginCount >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null,
          },
        });
      }
      await recordAudit(req, {
        action: 'auth.login', resourceType: 'user', resourceId: user?.id, result: 'FAILURE',
        tenantId: tenant.id, context: { reason: 'invalid_credentials' },
      });
      throw unauthorized('Correo o contraseña incorrectos');
    }

    const csrf = randomToken(24);
    const token = signSessionToken({
      sub: user.id,
      tenantId: user.tenantId,
      platform: user.isPlatformAdmin,
      csrf,
    });

    await prisma.internalUser.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockedUntil: null, lastLoginAt: new Date() },
    });
    await recordAudit(req, {
      action: 'auth.login', resourceType: 'user', resourceId: user.id, result: 'SUCCESS',
      tenantId: tenant.id, actorId: user.id,
    });

    res.cookie('bs_session', token, sessionCookie);
    res.json({ user: { id: user.id, name: user.name, email: user.email }, csrf });
  } catch (error) {
    next(error);
  }
}

export async function platformLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body as z.infer<typeof platformLoginSchema>;
    const user = await prisma.internalUser.findFirst({ where: { email, isPlatformAdmin: true, isActive: true } });
    const valid = await verifyPassword(password, user?.passwordHash);
    if (!user || !valid) {
      await recordAudit(req, {
        action: 'auth.platform_login', resourceType: 'user', resourceId: user?.id, result: 'FAILURE',
        context: { reason: 'invalid_credentials' },
      });
      throw unauthorized('Correo o contraseña incorrectos');
    }
    const csrf = randomToken(24);
    const token = signSessionToken({ sub: user.id, tenantId: null, platform: true, csrf });
    await prisma.internalUser.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    await recordAudit(req, {
      action: 'auth.platform_login', resourceType: 'user', resourceId: user.id, result: 'SUCCESS', actorId: user.id,
    });
    res.cookie('bs_session', token, sessionCookie);
    res.json({ user: { id: user.id, name: user.name, email: user.email }, csrf });
  } catch (error) {
    next(error);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.auth) throw unauthorized();
    const user = await prisma.internalUser.findUnique({
      where: { id: req.auth.userId },
      select: { id: true, name: true, email: true },
    });
    if (!user) throw unauthorized();
    res.json({ authenticated: true, user, csrf: req.auth.csrf, tenant: req.tenant });
  } catch (error) {
    next(error);
  }
}

export function logout(req: Request, res: Response) {
  res.clearCookie('bs_session', { ...sessionCookie, maxAge: undefined });
  void recordAudit(req, { action: 'auth.logout', resourceType: 'user', result: 'SUCCESS' });
  res.status(204).send();
}
