import express from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import { env } from './config/env.js';
import { prisma } from './utils/prisma.js';
import { logger } from './shared/logger.js';
import { correlationId } from './middleware/correlation.js';
import { errorHandler, notFoundHandler } from './middleware/error-handler.js';
import { authRoutes } from './modules/auth/auth-routes.js';
import { publicRoutes } from './modules/public/public-routes.js';
import { adminRoutes } from './modules/admin/admin-routes.js';
import { billingRoutes } from './modules/billing/billing-routes.js';
import { webhookRoutes } from './modules/webhooks/webhook-routes.js';
import { platformRoutes } from './modules/platform/platform-routes.js';

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  if (env.TRUST_PROXY) app.set('trust proxy', 1);

  app.use(correlationId);
  app.use((req, res, next) => {
    const startedAt = performance.now();
    res.on('finish', () => {
      logger.info('Request completed', {
        correlationId: req.correlationId,
        method: req.method,
        path: req.path,
        statusCode: res.statusCode,
        durationMs: Math.round(performance.now() - startedAt),
        tenantId: req.tenant?.id,
        userId: req.auth?.userId,
      });
    });
    next();
  });
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'same-site' },
  }));
  app.use(cors({
    credentials: true,
    origin(origin, callback) {
      if (!origin || env.allowedOrigins.includes(origin)) callback(null, true);
      else callback(null, false);
    },
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['content-type', 'x-tenant-slug', 'x-csrf-token', 'x-appointment-token', 'x-correlation-id', 'authorization'],
    maxAge: 600,
  }));
  app.use(rateLimit({
    windowMs: 60 * 1000,
    limit: 240,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: { code: 'RATE_LIMITED', message: 'Demasiadas solicitudes. Intenta de nuevo en un momento.' } },
  }));

  app.get('/api/health/live', (_req, res) => res.json({ status: 'ok' }));
  app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
  app.get('/api/health/ready', async (req, res, next) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'ready' });
    } catch (error) {
      next(error);
    }
  });

  // Signature verification requires the original bytes, so webhooks are mounted before JSON parsing.
  app.use('/api/webhooks', webhookRoutes);
  app.use(express.json({ limit: '1mb', strict: true }));
  app.use(cookieParser());

  app.use('/api/auth', authRoutes);
  app.use('/api/public', publicRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/billing', billingRoutes);
  app.use('/api/platform', platformRoutes);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
