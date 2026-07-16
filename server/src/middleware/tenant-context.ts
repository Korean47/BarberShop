import type { NextFunction, Request, Response } from 'express';
import { prisma } from '../utils/prisma.js';
import { env } from '../config/env.js';
import { badRequest, notFound } from '../shared/errors.js';

const slugPattern = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;

function tenantHint(req: Request) {
  const header = req.header('x-tenant-slug');
  if (header) {
    if (!slugPattern.test(header)) throw badRequest('INVALID_TENANT', 'La barbería indicada no es válida');
    return { slug: header };
  }

  const hostname = req.hostname.toLowerCase();
  if (hostname !== 'localhost' && !hostname.startsWith('127.')) return { hostname };
  return { slug: env.DEFAULT_TENANT_SLUG };
}

export async function resolveTenant(req: Request, _res: Response, next: NextFunction) {
  try {
    const hint = tenantHint(req);
    const tenant = await prisma.tenant.findFirst({
      where: 'slug' in hint ? { slug: hint.slug } : { domains: { some: { hostname: hint.hostname } } },
      include: { subscription: { select: { status: true, graceEndsAt: true } } },
    });

    if (!tenant) throw notFound('Barbería');

    req.tenant = {
      id: tenant.id,
      slug: tenant.slug,
      name: tenant.name,
      timezone: tenant.timezone,
      currency: tenant.currency,
      locale: tenant.locale,
      status: tenant.status,
      subscriptionStatus: tenant.subscription?.status ?? null,
      graceEndsAt: tenant.subscription?.graceEndsAt ?? null,
    };
    next();
  } catch (error) {
    next(error);
  }
}

export function requireTenant(req: Request) {
  if (!req.tenant) throw new Error('Tenant context middleware was not applied');
  return req.tenant;
}
