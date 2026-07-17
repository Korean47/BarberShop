import { describe, expect, it } from 'vitest';
import { accessAppointmentSchema } from '../src/modules/appointments/booking-schemas.js';

describe('secure appointment access', () => {
  it('requires both a public code and an associated phone', () => {
    expect(accessAppointmentSchema.safeParse({ phone: '6621234567' }).success).toBe(false);
    expect(accessAppointmentSchema.safeParse({ publicCode: 'A1B2C3D4' }).success).toBe(false);
    expect(accessAppointmentSchema.safeParse({ publicCode: 'a1b2c3d4', phone: '(662) 123-4567' }).success).toBe(true);
  });

  it('rejects enumerable or malformed codes', () => {
    expect(accessAppointmentSchema.safeParse({ publicCode: '1', phone: '6621234567' }).success).toBe(false);
    expect(accessAppointmentSchema.safeParse({ publicCode: '../../etc', phone: '6621234567' }).success).toBe(false);
  });
});
