import { Router } from 'express';
import { authenticate, requireCsrf, requirePermission } from '../../middleware/auth.js';
import { requireOperationalSubscription } from '../../middleware/subscription.js';
import {
  cancelAppointment,
  getAppointment,
  listAppointments,
  listBarbers,
  updateAppointment,
  validateAppointmentId,
} from './admin-appointments.js';
import { getBranding, updateBranding } from './admin-branding.js';
import { getSettings, updateSettings } from './admin-settings.js';
import { createBarber, createService, listCatalog, updateBarber, updateService } from './admin-catalog.js';

export const adminRoutes = Router();

adminRoutes.use(authenticate, requireOperationalSubscription);
adminRoutes.get('/appointments', requirePermission('appointments:read'), listAppointments);
adminRoutes.get('/appointments/:id', validateAppointmentId, requirePermission('appointments:read'), getAppointment);
adminRoutes.patch('/appointments/:id', validateAppointmentId, requireCsrf, requirePermission('appointments:write'), updateAppointment);
adminRoutes.delete('/appointments/:id', validateAppointmentId, requireCsrf, requirePermission('appointments:write'), cancelAppointment);
adminRoutes.get('/barbers', requirePermission('barbers:read'), listBarbers);
adminRoutes.get('/branding', requirePermission('settings:read'), getBranding);
adminRoutes.patch('/branding', requireCsrf, requirePermission('settings:write'), updateBranding);
adminRoutes.get('/settings', requirePermission('settings:read'), getSettings);
adminRoutes.patch('/settings', requireCsrf, requirePermission('settings:write'), updateSettings);
adminRoutes.get('/catalog', requirePermission('settings:read'), listCatalog);
adminRoutes.post('/services', requireCsrf, requirePermission('settings:write'), createService);
adminRoutes.patch('/services/:id', requireCsrf, requirePermission('settings:write'), updateService);
adminRoutes.post('/barbers', requireCsrf, requirePermission('barbers:write'), createBarber);
adminRoutes.patch('/barbers/:id', requireCsrf, requirePermission('barbers:write'), updateBarber);
