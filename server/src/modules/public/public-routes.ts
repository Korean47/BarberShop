import { Router } from 'express';
import { ipKeyGenerator, rateLimit } from 'express-rate-limit';
import { resolveTenant } from '../../middleware/tenant-context.js';
import { requireOperationalSubscription } from '../../middleware/subscription.js';
import { validateBody } from '../../middleware/validate.js';
import { tenantContext, barbers, services } from '../catalog/catalog-controller.js';
import { availability } from '../availability/availability-controller.js';
import { create, getManaged, updateManaged } from '../appointments/booking-controller.js';
import { createBookingSchema, manageAppointmentSchema } from '../appointments/booking-schemas.js';
import {
  downloadReferenceImage,
  referenceImageUpload,
  uploadReferenceImage,
} from '../files/appointment-images.js';

export const publicRoutes = Router();

const bookingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  keyGenerator: (req) => `${ipKeyGenerator(req.ip ?? '')}:${req.tenant?.id ?? 'unknown'}`,
  message: { error: { code: 'RATE_LIMITED', message: 'Espera unos minutos antes de intentar otra reserva.' } },
});

publicRoutes.use(resolveTenant);
publicRoutes.get('/context', tenantContext);
publicRoutes.get('/barbers', barbers);
publicRoutes.get('/services', services);
publicRoutes.get('/availability', requireOperationalSubscription, availability);
publicRoutes.post(
  '/appointments',
  bookingLimiter,
  requireOperationalSubscription,
  validateBody(createBookingSchema),
  create,
);
publicRoutes.get('/appointments/manage', getManaged);
publicRoutes.patch('/appointments/manage', bookingLimiter, validateBody(manageAppointmentSchema), updateManaged);
publicRoutes.post(
  '/appointments/manage/reference-images',
  bookingLimiter,
  referenceImageUpload,
  uploadReferenceImage,
);
publicRoutes.get('/appointments/manage/reference-images/:imageId', downloadReferenceImage);
