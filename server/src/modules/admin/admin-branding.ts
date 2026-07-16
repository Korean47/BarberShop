import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { contrastRatio } from '../../domain/color-contrast.js';
import { requireTenant } from '../../middleware/tenant-context.js';
import { prisma } from '../../utils/prisma.js';
import { badRequest } from '../../shared/errors.js';
import { recordAudit } from '../audit/audit-service.js';

const hex = z.string().regex(/^#[0-9a-f]{6}$/i, 'Usa un color hexadecimal válido');
const brandingSchema = z.object({
  logoUrl: z.string().max(500).nullable().optional(),
  heroImageUrl: z.string().max(500).nullable().optional(),
  primaryColor: hex,
  secondaryColor: hex,
  accentColor: hex,
  backgroundColor: hex,
  fontFamily: z.enum(['Inter', 'DM Sans', 'Playfair Display', 'Cormorant Garamond']),
  publish: z.boolean().default(false),
});

function validateContrast(input: z.infer<typeof brandingSchema>) {
  const failures: string[] = [];
  if (contrastRatio(input.secondaryColor, '#ffffff') < 4.5) failures.push('El color secundario no tiene contraste suficiente con texto blanco');
  if (contrastRatio(input.primaryColor, input.backgroundColor) < 3) failures.push('El color principal se pierde sobre el fondo');
  if (contrastRatio(input.accentColor, input.secondaryColor) < 3) failures.push('El acento no se distingue sobre el color secundario');
  if (failures.length) throw badRequest('INSUFFICIENT_CONTRAST', 'Ajusta la combinación de colores', failures);
}

export async function getBranding(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = requireTenant(req);
    res.json(await prisma.tenantBranding.findUnique({ where: { tenantId: tenant.id } }));
  } catch (error) {
    next(error);
  }
}

export async function updateBranding(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = requireTenant(req);
    const input = brandingSchema.parse(req.body);
    validateContrast(input);
    const { publish, ...data } = input;
    const branding = await prisma.tenantBranding.upsert({
      where: { tenantId: tenant.id },
      update: { ...data, ...(publish ? { publishedAt: new Date() } : {}) },
      create: { tenantId: tenant.id, ...data, publishedAt: publish ? new Date() : null },
    });
    await recordAudit(req, {
      action: publish ? 'branding.publish' : 'branding.update',
      resourceType: 'tenant_branding',
      resourceId: tenant.id,
      result: 'SUCCESS',
    });
    res.json(branding);
  } catch (error) {
    next(error);
  }
}
