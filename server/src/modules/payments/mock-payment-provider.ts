import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import { env } from '../../config/env.js';
import { hmacSha256, safeEqualHex } from '../../shared/crypto.js';
import { badRequest, forbidden } from '../../shared/errors.js';
import type { CreatePaymentInput, PaymentProvider, VerifiedWebhookEvent } from './payment-provider.js';

const eventSchema = z.object({
  id: z.string().min(1).max(190),
  type: z.enum(['payment.paid', 'payment.failed', 'subscription.updated']),
  data: z.record(z.unknown()),
});

export class MockPaymentProvider implements PaymentProvider {
  readonly name = 'mock';

  async createPayment(input: CreatePaymentInput) {
    const providerPaymentId = `mock_${randomUUID()}`;
    return {
      providerPaymentId,
      clientSecret: `mock_secret_${input.appointmentId}_${input.idempotencyKey.slice(0, 12)}`,
    };
  }

  verifyWebhook(payload: Buffer, signature: string | undefined): VerifiedWebhookEvent {
    if (!signature || !safeEqualHex(signature, hmacSha256(payload, env.PAYMENT_WEBHOOK_SECRET))) {
      throw forbidden('INVALID_WEBHOOK_SIGNATURE', 'Firma de webhook inválida');
    }

    try {
      return eventSchema.parse(JSON.parse(payload.toString('utf8')));
    } catch {
      throw badRequest('INVALID_WEBHOOK_PAYLOAD', 'Evento de webhook inválido');
    }
  }
}
