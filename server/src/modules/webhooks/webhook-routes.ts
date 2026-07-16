import express, { Router } from 'express';
import { paymentWebhook } from './payment-webhook.js';

export const webhookRoutes = Router();

webhookRoutes.post('/payments', express.raw({ type: 'application/json', limit: '256kb' }), paymentWebhook);
