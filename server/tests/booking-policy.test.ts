import { DateTime } from 'luxon';
import { describe, expect, it } from 'vitest';
import {
  bookingPolicyFromSettings,
  canCustomerModify,
  dateIsInsideBookingWindow,
  startMeetsMinimumNotice,
} from '../src/domain/booking-policy.js';

describe('booking policy', () => {
  const policy = bookingPolicyFromSettings({
    'booking.minimumNoticeMinutes': '120',
    'booking.maxAdvanceDays': '90',
    'booking.cancellationHours': '2',
    'booking.holdMinutes': '30',
  });
  const now = DateTime.fromISO('2026-07-17T12:00:00Z');

  it('limits calendar navigation to the configured window', () => {
    expect(dateIsInsideBookingWindow('2026-07-17', 'America/Hermosillo', policy, now)).toBe(true);
    expect(dateIsInsideBookingWindow('2026-10-15', 'America/Hermosillo', policy, now)).toBe(true);
    expect(dateIsInsideBookingWindow('2026-10-16', 'America/Hermosillo', policy, now)).toBe(false);
    expect(dateIsInsideBookingWindow('2026-07-16', 'America/Hermosillo', policy, now)).toBe(false);
  });

  it('applies minimum notice to individual slots', () => {
    expect(startMeetsMinimumNotice(now.plus({ minutes: 119 }), policy, now)).toBe(false);
    expect(startMeetsMinimumNotice(now.plus({ minutes: 120 }), policy, now)).toBe(true);
  });

  it('blocks customer changes inside the cutoff while keeping the boundary valid', () => {
    const current = new Date('2026-07-17T12:00:00Z');
    expect(canCustomerModify(new Date('2026-07-17T13:59:59Z'), policy, current)).toBe(false);
    expect(canCustomerModify(new Date('2026-07-17T14:00:00Z'), policy, current)).toBe(true);
  });
});
