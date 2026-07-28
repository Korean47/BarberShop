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
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        quantity: 1,
        price_data: {
          currency: input.currency.toLowerCase(),
          unit_amount: input.amountCents,
          product_data: { name: input.description },
        },
      }],
      customer_email: input.customerEmail,
      metadata: { appointmentId: input.appointmentId },
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      expires_at: Math.floor(input.expiresAt.getTime() / 1000),
    }, { idempotencyKey: input.idempotencyKey });
    if (!session.url) throw new Error('Stripe did not return a checkout URL');
    return { providerPaymentId: session.id, checkoutUrl: session.url, expiresAt: input.expiresAt };
  }

  verifyWebhook(payload: Buffer, signature: string | undefined): VerifiedWebhookEvent {
    if (!signature) throw forbidden('INVALID_WEBHOOK_SIGNATURE', 'Firma de webhook inválida');
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET!);
    } catch {
      throw forbidden('INVALID_WEBHOOK_SIGNATURE', 'Firma de webhook inválida');
    }

    if (event.type === 'checkout.session.completed' || event.type === 'checkout.session.expired') {
      const session = event.data.object;
      return {
        id: event.id,
        type: event.type === 'checkout.session.completed' ? 'payment.paid' : 'payment.failed',
        data: { providerPaymentId: session.id },
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
