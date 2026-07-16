import { describe, expect, it } from 'vitest';
import { canTransitionAppointment } from '../src/domain/appointment-status.js';

describe('appointment status machine', () => {
  it('supports the normal service lifecycle', () => {
    expect(canTransitionAppointment('PENDING', 'CONFIRMED')).toBe(true);
    expect(canTransitionAppointment('CONFIRMED', 'CHECKED_IN')).toBe(true);
    expect(canTransitionAppointment('CHECKED_IN', 'IN_PROGRESS')).toBe(true);
    expect(canTransitionAppointment('IN_PROGRESS', 'COMPLETED')).toBe(true);
  });

  it('does not reopen terminal appointments', () => {
    expect(canTransitionAppointment('COMPLETED', 'CONFIRMED')).toBe(false);
    expect(canTransitionAppointment('CANCELLED', 'CONFIRMED')).toBe(false);
    expect(canTransitionAppointment('NO_SHOW', 'CONFIRMED')).toBe(false);
  });
});
