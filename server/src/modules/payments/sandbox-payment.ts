import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { requireTenant } from '../../middleware/tenant-context.js';
import { notFound } from '../../shared/errors.js';
import { prisma } from '../../utils/prisma.js';

const paramsSchema = z.object({ paymentId: z.string().regex(/^mock_[0-9a-f-]{36}$/i) });
const bodySchema = z.object({ outcome: z.enum(['paid', 'failed']) });

export async function settleSandboxPayment(req: Request, res: Response, next: NextFunction) {
  try {
    if (env.PAYMENT_PROVIDER !== 'mock' || env.NODE_ENV === 'production') throw notFound('Pago');
    const tenant = requireTenant(req);
    const { paymentId } = paramsSchema.parse(req.params);
    const { outcome } = bodySchema.parse(req.body);
    const payment = await prisma.payment.findFirst({
      where: { providerPaymentId: paymentId, tenantId: tenant.id },
      include: { appointment: true },
    });
    if (!payment) throw notFound('Pago');
    if (payment.status === 'PAID') {
      res.json({ status: 'paid', duplicate: true });
      return;
    }
    if (payment.status !== 'PENDING') {
      res.json({ status: payment.status.toLowerCase(), duplicate: true });
      return;
    }

    const paymentStatus = outcome === 'paid' ? 'PAID' : 'FAILED';
    const appointmentStatus = outcome === 'paid' ? 'CONFIRMED' : 'CANCELLED';
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: paymentStatus,
          paidAt: outcome === 'paid' ? new Date() : null,
          attempts: {
            create: {
              idempotencyKey: `sandbox:${payment.id}:${outcome}`,
              status: paymentStatus,
              failureCode: outcome === 'failed' ? 'sandbox_declined' : null,
            },
          },
        },
      });
      if (payment.appointment.status === 'PENDING') {
        await tx.appointment.update({
          where: { id: payment.appointmentId },
          data: {
            status: appointmentStatus,
            holdExpiresAt: null,
            statusHistory: {
              create: {
                fromStatus: 'PENDING',
                toStatus: appointmentStatus,
                reason: outcome === 'paid' ? 'Pago sandbox confirmado' : 'Pago sandbox rechazado',
              },
            },
          },
        });
      }
    });
    res.json({ status: paymentStatus.toLowerCase(), duplicate: false });
  } catch (error) {
    next(error);
  }
}
