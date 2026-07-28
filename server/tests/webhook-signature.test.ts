import { describe, expect, it } from 'vitest';
import { hmacSha256 } from '../src/shared/crypto.js';
import { MockPaymentProvider } from '../src/modules/payments/mock-payment-provider.js';
import { env } from '../src/config/env.js';

describe('payment webhooks', () => {
  it('accepts a correctly signed event', () => {
    const payload = Buffer.from(JSON.stringify({
      id: 'evt_123',
      type: 'payment.paid',
      data: { providerPaymentId: 'pay_123' },
    }));
    const event = new MockPaymentProvider().verifyWebhook(payload, hmacSha256(payload, env.PAYMENT_WEBHOOK_SECRET));
    expect(event.id).toBe('evt_123');
  });

  it('rejects unsigned and tampered events', () => {
    const payload = Buffer.from('{"id":"evt_123","type":"payment.paid","data":{}}');
    expect(() => new MockPaymentProvider().verifyWebhook(payload, undefined)).toThrow('Firma de webhook inválida');
    expect(() => new MockPaymentProvider().verifyWebhook(payload, '00'.repeat(32))).toThrow('Firma de webhook inválida');
  });
});
