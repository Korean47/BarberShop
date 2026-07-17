import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { contrastRatio } from '../../domain/color-contrast.js';
import { requireTenant } from '../../middleware/tenant-context.js';
import { badRequest } from '../../shared/errors.js';
import { prisma } from '../../utils/prisma.js';
import { recordAudit } from '../audit/audit-service.js';
import { onlinePaymentsConfigured } from '../payments/provider-registry.js';

const optionalUrl = z.string().trim().url().max(500).nullable().or(z.literal(''));
const assetUrlValue = z.union([
  z.string().trim().url().max(500),
  z.string().trim().regex(/^\/[a-zA-Z0-9/_\-.]+$/).max(500),
]);
const assetUrl = assetUrlValue.nullable().or(z.literal(''));
const hex = z.string().regex(/^#[0-9a-f]{6}$/i);
const scheduleSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startMinute: z.number().int().min(0).max(1439),
  endMinute: z.number().int().min(1).max(1440),
  isOpen: z.boolean(),
}).refine((value) => !value.isOpen || value.endMinute > value.startMinute, 'El horario de cierre debe ser posterior a la apertura');

const settingsSchema = z.object({
  business: z.object({
    name: z.string().trim().min(2).max(160),
    contactEmail: z.string().trim().email().max(254).nullable().or(z.literal('')),
    contactPhone: z.string().trim().max(32).nullable().or(z.literal('')),
    timezone: z.enum(['America/Hermosillo', 'America/Mexico_City', 'America/Tijuana', 'America/Chihuahua']),
    currency: z.literal('MXN'),
  }).optional(),
  location: z.object({
    id: z.string().uuid(),
    name: z.string().trim().min(2).max(140),
    addressLine1: z.string().trim().min(3).max(200),
    addressLine2: z.string().trim().max(200).nullable().or(z.literal('')),
    city: z.string().trim().min(2).max(120),
    state: z.string().trim().min(2).max(120),
    postalCode: z.string().trim().max(20).nullable().or(z.literal('')),
    phone: z.string().trim().max(32).nullable().or(z.literal('')),
    mapsUrl: optionalUrl,
    schedules: z.array(scheduleSchema).max(7),
  }).optional(),
  branding: z.object({
    logoUrl: assetUrl,
    heroImageUrl: assetUrl,
    heroVideoUrl: assetUrl,
    heroMobileVideoUrl: assetUrl,
    heroPosterUrl: assetUrl,
    heroFallbackUrls: z.array(assetUrlValue).max(6),
    heroTitle: z.string().trim().min(10).max(180),
    heroSubtitle: z.string().trim().min(10).max(300),
    shopImageUrl: assetUrl,
    mapUrl: optionalUrl,
    whatsappUrl: optionalUrl,
    instagramUrl: optionalUrl,
    primaryColor: hex,
    secondaryColor: hex,
    accentColor: hex,
    backgroundColor: hex,
    fontFamily: z.enum(['Inter', 'DM Sans', 'Source Sans 3', 'system-ui']),
    publish: z.boolean(),
  }).optional(),
  booking: z.object({
    minimumNoticeMinutes: z.number().int().min(0).max(10_080),
    maxAdvanceDays: z.number().int().min(1).max(365),
    changeCutoffHours: z.number().int().min(0).max(168),
    slotIntervalMinutes: z.number().int().min(5).max(60),
    holdMinutes: z.number().int().min(5).max(60),
  }).optional(),
  payments: z.object({ allowCash: z.boolean(), allowOnline: z.boolean() }).optional(),
});

export async function getSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = requireTenant(req);
    const data = await prisma.tenant.findUniqueOrThrow({
      where: { id: tenant.id },
      select: {
        name: true,
        contactEmail: true,
        contactPhone: true,
        timezone: true,
        currency: true,
        branding: true,
        settings: { select: { key: true, value: true } },
        locations: {
          where: { isActive: true },
          orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
          include: { businessSchedules: { orderBy: { dayOfWeek: 'asc' } }, scheduleExceptions: { orderBy: { date: 'asc' } } },
        },
      },
    });
    res.json({
      ...data,
      paymentConfiguration: {
        provider: env.PAYMENT_PROVIDER,
        onlineConfigured: onlinePaymentsConfigured(),
        environment: env.NODE_ENV,
      },
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSettings(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = requireTenant(req);
    const input = settingsSchema.parse(req.body);
    if (input.payments?.allowOnline && !onlinePaymentsConfigured()) {
      throw badRequest('PAYMENT_PROVIDER_REQUIRED', 'Configura un proveedor de pago antes de activar el pago en línea');
    }
    if (input.branding) {
      const failures: string[] = [];
      if (contrastRatio(input.branding.secondaryColor, '#ffffff') < 4.5) failures.push('El color de texto no tiene contraste suficiente con blanco');
      if (contrastRatio(input.branding.primaryColor, input.branding.backgroundColor) < 3) failures.push('El color principal no se distingue del fondo');
      if (failures.length) throw badRequest('INSUFFICIENT_CONTRAST', 'Ajusta la combinación de colores', failures);
    }

    await prisma.$transaction(async (tx) => {
      if (input.business) {
        await tx.tenant.update({
          where: { id: tenant.id },
          data: {
            ...input.business,
            contactEmail: input.business.contactEmail || null,
            contactPhone: input.business.contactPhone || null,
          },
        });
      }
      if (input.location) {
        const { schedules, ...location } = input.location;
        await tx.location.update({
          where: { id: location.id, tenantId: tenant.id },
          data: {
            ...location,
            addressLine2: location.addressLine2 || null,
            postalCode: location.postalCode || null,
            phone: location.phone || null,
            mapsUrl: location.mapsUrl || null,
          },
        });
        for (const schedule of schedules) {
          await tx.businessSchedule.upsert({
            where: { locationId_dayOfWeek: { locationId: location.id, dayOfWeek: schedule.dayOfWeek } },
            update: schedule,
            create: { locationId: location.id, ...schedule },
          });
        }
      }
      if (input.branding) {
        const { publish, heroFallbackUrls, ...branding } = input.branding;
        const normalized = Object.fromEntries(Object.entries(branding).map(([key, value]) => [key, value === '' ? null : value]));
        await tx.tenantBranding.upsert({
          where: { tenantId: tenant.id },
          update: { ...normalized, heroFallbackUrls: JSON.stringify(heroFallbackUrls), ...(publish ? { publishedAt: new Date() } : {}) },
          create: { tenantId: tenant.id, ...normalized, heroFallbackUrls: JSON.stringify(heroFallbackUrls), publishedAt: publish ? new Date() : null },
        });
      }
      const settingUpdates: Record<string, string> = {};
      if (input.booking) {
        settingUpdates['booking.minimumNoticeMinutes'] = String(input.booking.minimumNoticeMinutes);
        settingUpdates['booking.maxAdvanceDays'] = String(input.booking.maxAdvanceDays);
        settingUpdates['booking.cancellationHours'] = String(input.booking.changeCutoffHours);
        settingUpdates['booking.slotIntervalMinutes'] = String(input.booking.slotIntervalMinutes);
        settingUpdates['booking.holdMinutes'] = String(input.booking.holdMinutes);
      }
      if (input.payments) {
        settingUpdates['booking.allowCash'] = String(input.payments.allowCash);
        settingUpdates['booking.allowOnline'] = String(input.payments.allowOnline);
      }
      for (const [key, value] of Object.entries(settingUpdates)) {
        await tx.tenantSetting.upsert({
          where: { tenantId_key: { tenantId: tenant.id, key } },
          update: { value },
          create: { tenantId: tenant.id, key, value },
        });
      }
    });

    await recordAudit(req, {
      action: 'settings.update', resourceType: 'tenant_settings', resourceId: tenant.id, result: 'SUCCESS',
      context: { sections: Object.keys(input) },
    });
    return getSettings(req, res, next);
  } catch (error) {
    next(error);
  }
}
