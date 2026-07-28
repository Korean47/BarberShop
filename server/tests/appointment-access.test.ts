import { describe, expect, it } from 'vitest';
import { accessAppointmentSchema } from '../src/modules/appointments/booking-schemas.js';

describe('secure appointment access', () => {
  it('requires both a complete phone and an appointment date', () => {
    expect(accessAppointmentSchema.safeParse({ phone: '6621234567' }).success).toBe(false);
    expect(accessAppointmentSchema.safeParse({ date: '2026-07-20' }).success).toBe(false);
    expect(accessAppointmentSchema.safeParse({ date: '2026-07-20', phone: '(662) 123-4567' }).success).toBe(true);
  });

  it('rejects incomplete phones and malformed dates', () => {
    expect(accessAppointmentSchema.safeParse({ date: '2026-07-20', phone: '1234567' }).success).toBe(false);
    expect(accessAppointmentSchema.safeParse({ date: '../../etc', phone: '6621234567' }).success).toBe(false);
  });
});
