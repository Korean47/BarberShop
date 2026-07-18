import { z } from 'zod';

const phoneSchema = z
  .string()
  .trim()
  .min(7)
  .max(32)
  .transform((value) => value.replace(/[^\d+]/g, ''));

export const createBookingSchema = z.object({
  locationId: z.string().uuid().optional(),
  barberId: z.string().uuid().nullable().optional(),
  serviceIds: z.array(z.string().uuid()).min(1).max(3).refine((ids) => new Set(ids).size === ids.length, 'No repitas servicios'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  customer: z.object({
    name: z.string().trim().min(2).max(160),
    phone: phoneSchema,
    email: z.string().trim().toLowerCase().email().max(254).optional().or(z.literal('')),
    notes: z.string().trim().max(1000).optional(),
    consent: z.literal(true),
  }),
  paymentMethod: z.enum(['CASH', 'ONLINE']),
});

export const manageAppointmentSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('cancel'), reason: z.string().trim().max(240).optional() }),
  z.object({
    action: z.literal('reschedule'),
    date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  }),
]);

export const accessAppointmentSchema = z.object({
  phone: phoneSchema.refine((value) => value.replace(/\D/g, '').length >= 10, 'Ingresa el número completo'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type ManageAppointmentInput = z.infer<typeof manageAppointmentSchema>;
export type AccessAppointmentInput = z.infer<typeof accessAppointmentSchema>;
