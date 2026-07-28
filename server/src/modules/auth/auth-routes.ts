import { Router } from 'express';
import { rateLimit } from 'express-rate-limit';
import { authenticate, requireCsrf } from '../../middleware/auth.js';
import { resolveTenant } from '../../middleware/tenant-context.js';
import { validateBody } from '../../middleware/validate.js';
import { login, loginSchema, logout, me, platformLogin, platformLoginSchema } from './auth-controller.js';

export const authRoutes = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: { code: 'RATE_LIMITED', message: 'Demasiados intentos. Espera unos minutos.' } },
});

authRoutes.post('/login', loginLimiter, resolveTenant, validateBody(loginSchema), login);
authRoutes.post('/platform/login', loginLimiter, validateBody(platformLoginSchema), platformLogin);
authRoutes.get('/me', (req, res, next) => {
  if (!req.cookies?.bs_session && !req.header('authorization')) {
    res.json({ authenticated: false });
    return;
  }
  next();
}, authenticate, me);
authRoutes.post('/logout', authenticate, requireCsrf, logout);
