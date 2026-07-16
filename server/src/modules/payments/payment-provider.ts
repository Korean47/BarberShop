export interface CreatePaymentInput {
  amountCents: number;
  currency: string;
  idempotencyKey: string;
  appointmentId: string;
}

export interface CreatedPayment {
  providerPaymentId: string;
  clientSecret: string;
}

export interface VerifiedWebhookEvent {
  id: string;
  type: 'payment.paid' | 'payment.failed' | 'subscription.updated';
  data: Record<string, unknown>;
}

export interface PaymentProvider {
  readonly name: string;
  createPayment(input: CreatePaymentInput): Promise<CreatedPayment>;
  verifyWebhook(payload: Buffer, signature: string | undefined): VerifiedWebhookEvent;
}
