import type { NextFunction, Request, Response } from 'express';
import { PaymentStatus, Prisma, SubscriptionStatus } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../../utils/prisma.js';
import { sha256 } from '../../shared/crypto.js';
import { badRequest, notFound } from '../../shared/errors.js';
import { getPaymentProvider } from '../payments/provider-registry.js';

const paymentDataSchema = z.object({ providerPaymentId: z.string().min(1).max(190) });
const subscriptionDataSchema = z.object({
  providerSubscriptionId: z.string().min(1).max(190),
  status: z.nativeEnum(SubscriptionStatus),
  currentPeriodEnd: z.string().datetime().optional(),
  graceEndsAt: z.string().datetime().nullable().optional(),
});

export async function paymentWebhook(req: Request, res: Response, next: NextFunction) {
  try {
    if (!Buffer.isBuffer(req.body)) throw badRequest('RAW_BODY_REQUIRED', 'Webhook inválido');
    const provider = getPaymentProvider();
    const signature = provider.name === 'stripe'
      ? req.header('stripe-signature')
      : req.header('x-webhook-signature');
    const event = provider.verifyWebhook(req.body, signature);
    const existing = await prisma.externalEvent.findUnique({
      where: { provider_externalEventId: { provider: provider.name, externalEventId: event.id } },
    });
    if (existing?.processedAt) {
      res.json({ received: true, duplicate: true });
      return;
    }

    try {
      await prisma.$transaction(async (tx) => {
        const eventRecord = existing ?? await tx.externalEvent.create({
          data: {
            provider: provider.name,
            externalEventId: event.id,
            type: event.type,
            payloadHash: sha256(req.body as Buffer),
          },
        });

        let tenantId: string | null = null;
        if (event.type === 'payment.paid' || event.type === 'payment.failed') {
          const data = paymentDataSchema.parse(event.data);
          const payment = await tx.payment.findUnique({
            where: { providerPaymentId: data.providerPaymentId },
            include: { appointment: { select: { status: true } } },
          });
          if (!payment) throw notFound('Pago');
          tenantId = payment.tenantId;
          const nextStatus: PaymentStatus = event.type === 'payment.paid' ? 'PAID' : 'FAILED';
          await tx.payment.update({
            where: { id: payment.id },
            data: {
              status: nextStatus,
              paidAt: nextStatus === 'PAID' ? new Date() : null,
              attempts: {
                create: {
                  idempotencyKey: `${provider.name}:${event.id}`,
                  status: nextStatus,
                  failureCode: nextStatus === 'FAILED' ? 'provider_declined' : null,
                },
              },
            },
          });
          if (payment.appointment.status === 'PENDING') {
            const appointmentStatus = nextStatus === 'PAID' ? 'CONFIRMED' : 'CANCELLED';
            await tx.appointment.update({
              where: { id: payment.appointmentId },
              data: {
                status: appointmentStatus,
                holdExpiresAt: null,
                statusHistory: {
                  create: {
                    fromStatus: 'PENDING',
                    toStatus: appointmentStatus,
                    reason: nextStatus === 'PAID' ? 'Pago confirmado' : 'Pago rechazado o checkout vencido',
                  },
                },
              },
            });
          }
        } else {
          const data = subscriptionDataSchema.parse(event.data);
          const subscription = await tx.subscription.findUnique({
            where: { providerSubscriptionId: data.providerSubscriptionId },
          });
          if (!subscription) throw notFound('Suscripción');
          tenantId = subscription.tenantId;
          await tx.subscription.update({
            where: { id: subscription.id },
            data: {
              status: data.status,
              currentPeriodEnd: data.currentPeriodEnd ? new Date(data.currentPeriodEnd) : undefined,
              graceEndsAt: data.graceEndsAt === null ? null : data.graceEndsAt ? new Date(data.graceEndsAt) : undefined,
              events: {
                create: {
                  externalEventId: event.id,
                  type: event.type,
                  previousStatus: subscription.status,
                  nextStatus: data.status,
                  correlationId: req.correlationId,
                },
              },
            },
          });
        }

        await tx.externalEvent.update({
          where: { id: eventRecord.id },
          data: { tenantId, processedAt: new Date() },
        });
      }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        res.json({ received: true, duplicate: true });
        return;
      }
      throw error;
    }

    res.json({ received: true, duplicate: false });
  } catch (error) {
    next(error);
  }
}
