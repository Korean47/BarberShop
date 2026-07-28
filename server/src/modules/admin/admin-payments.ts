import { PaymentMethod, PaymentStatus } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { requireTenant } from '../../middleware/tenant-context.js';
import { badRequest, notFound } from '../../shared/errors.js';
import { prisma } from '../../utils/prisma.js';
import { recordAudit } from '../audit/audit-service.js';

const filtersSchema = z.object({
  status: z.nativeEnum(PaymentStatus).optional(),
  method: z.nativeEnum(PaymentMethod).optional(),
});

export async function listPayments(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = requireTenant(req);
    const filters = filtersSchema.parse(req.query);
    const items = await prisma.payment.findMany({
      where: { tenantId: tenant.id, ...filters },
      include: {
        appointment: {
          include: {
            customer: { select: { id: true, name: true, phone: true, email: true } },
            barber: { select: { id: true, displayName: true } },
            location: { select: { id: true, name: true } },
            services: { include: { service: { select: { id: true, name: true } } }, orderBy: { service: { sortOrder: 'asc' } } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    const summary = items.reduce((totals, payment) => {
      totals.count += 1;
      if (payment.status === 'PAID') totals.paidCents += payment.amountCents;
      else if (payment.status === 'PENDING') totals.pendingCents += payment.amountCents;
      else if (payment.status === 'REFUNDED') totals.refundedCents += payment.amountCents;
      else totals.failedCents += payment.amountCents;
      return totals;
    }, { count: 0, paidCents: 0, pendingCents: 0, failedCents: 0, refundedCents: 0 });

    res.json({
      summary,
      items: items.map((payment) => ({
        id: payment.id,
        method: payment.method.toLowerCase(),
        status: payment.status.toLowerCase(),
        provider: payment.provider,
        providerPaymentId: payment.providerPaymentId,
        amountCents: payment.amountCents,
        currency: payment.currency,
        createdAt: payment.createdAt.toISOString(),
        updatedAt: payment.updatedAt.toISOString(),
        appointment: {
          id: payment.appointment.id,
          publicCode: payment.appointment.publicCode,
          status: payment.appointment.status.toLowerCase(),
          startsAt: payment.appointment.startsAt.toISOString(),
          customer: payment.appointment.customer,
          barber: { id: payment.appointment.barber.id, name: payment.appointment.barber.displayName },
          location: payment.appointment.location,
          services: payment.appointment.services.map(({ service }) => service),
        },
      })),
    });
  } catch (error) {
    next(error);
  }
}

export async function markCashPaymentPaid(req: Request, res: Response, next: NextFunction) {
  try {
    const tenant = requireTenant(req);
    const id = z.string().uuid().parse(req.params.id);
    const payment = await prisma.payment.findFirst({ where: { id, tenantId: tenant.id } });
    if (!payment) throw notFound('Pago');
    if (payment.method !== 'CASH') throw badRequest('PROVIDER_MANAGED_PAYMENT', 'Los pagos en línea sólo cambian mediante el webhook firmado del proveedor');
    if (payment.status !== 'PENDING' && payment.status !== 'AUTHORIZED' && payment.status !== 'PAID') {
      throw badRequest('PAYMENT_NOT_COLLECTABLE', 'Este pago ya no puede marcarse como cobrado');
    }
    const updated = payment.status === 'PAID' ? payment : await prisma.payment.update({ where: { id }, data: { status: 'PAID', paidAt: new Date() } });
    await recordAudit(req, { action: 'payment.cash_paid', resourceType: 'payment', resourceId: payment.id, result: 'SUCCESS', context: { appointmentId: payment.appointmentId } });
    res.json({ id: updated.id, status: updated.status.toLowerCase(), paidAt: updated.paidAt?.toISOString() ?? null });
  } catch (error) {
    next(error);
  }
}
