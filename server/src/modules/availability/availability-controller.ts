import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { requireTenant } from '../../middleware/tenant-context.js';
import { findAvailability } from './availability-service.js';

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  serviceIds: z.string().min(1).transform((value) => value.split(',').filter(Boolean)).pipe(z.array(z.string().uuid()).min(1).max(3)),
  barberId: z.string().uuid().optional(),
  locationId: z.string().uuid().optional(),
});

export async function availability(req: Request, res: Response, next: NextFunction) {
  try {
    const query = querySchema.parse(req.query);
    const tenant = requireTenant(req);
    res.json(await findAvailability({
      tenantId: tenant.id,
      timezone: tenant.timezone,
      ...query,
    }));
  } catch (error) {
    next(error);
  }
}
