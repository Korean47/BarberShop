import { env } from '../../config/env.js';
import type { PaymentProvider } from './payment-provider.js';
import { MockPaymentProvider } from './mock-payment-provider.js';
import { StripePaymentProvider } from './stripe-payment-provider.js';

let provider: PaymentProvider | undefined;

export function getPaymentProvider() {
  if (!provider) {
    provider = env.PAYMENT_PROVIDER === 'stripe' ? new StripePaymentProvider() : new MockPaymentProvider();
  }
  return provider;
}
