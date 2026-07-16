import Stripe from 'stripe';
import { env } from '../../config/env.js';
import { badRequest, forbidden } from '../../shared/errors.js';
import type { CreatePaymentInput, PaymentProvider, VerifiedWebhookEvent } from './payment-provider.js';

const statusMap: Record<Stripe.Subscription.Status, string> = {
  active: 'ACTIVE',
  trialing: 'TRIAL',
  past_due: 'PAST_DUE',
  unpaid: 'SUSPENDED',
  canceled: 'CANCELLED',
  incomplete: 'PAST_DUE',
  incomplete_expired: 'EXPIRED',
  paused: 'SUSPENDED',
};

export class StripePaymentProvider implements PaymentProvider {
  readonly name = 'stripe';
  private readonly stripe = new Stripe(env.STRIPE_SECRET_KEY!);

  async createPayment(input: CreatePaymentInput) {
    const intent = await this.stripe.paymentIntents.create({
      amount: input.amountCents,
      currency: input.currency.toLowerCase(),
      automatic_payment_methods: { enabled: true },
      metadata: { appointmentId: input.appointmentId },
    }, { idempotencyKey: input.idempotencyKey });
    if (!intent.client_secret) throw new Error('Stripe did not return a client secret');
    return { providerPaymentId: intent.id, clientSecret: intent.client_secret };
  }

  verifyWebhook(payload: Buffer, signature: string | undefined): VerifiedWebhookEvent {
    if (!signature) throw forbidden('INVALID_WEBHOOK_SIGNATURE', 'Firma de webhook inválida');
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET!);
    } catch {
      throw forbidden('INVALID_WEBHOOK_SIGNATURE', 'Firma de webhook inválida');
    }

    if (event.type === 'payment_intent.succeeded' || event.type === 'payment_intent.payment_failed') {
      const intent = event.data.object;
      return {
        id: event.id,
        type: event.type === 'payment_intent.succeeded' ? 'payment.paid' : 'payment.failed',
        data: { providerPaymentId: intent.id },
      };
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const subscription = event.data.object;
      const currentPeriodEnd = subscription.items.data.reduce(
        (latest, item) => Math.max(latest, item.current_period_end),
        0,
      );
      return {
        id: event.id,
        type: 'subscription.updated',
        data: {
          providerSubscriptionId: subscription.id,
          status: statusMap[subscription.status],
          currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000).toISOString() : undefined,
        },
      };
    }

    throw badRequest('UNSUPPORTED_WEBHOOK_EVENT', 'El evento no corresponde a una operación admitida');
  }
}
