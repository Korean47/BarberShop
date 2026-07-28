import { DateTime } from 'luxon';

export interface BookingPolicy {
  minimumNoticeMinutes: number;
  maxAdvanceDays: number;
  changeCutoffHours: number;
  holdMinutes: number;
}

export function bookingPolicyFromSettings(settings: Record<string, string>): BookingPolicy {
  return {
    minimumNoticeMinutes: clampNumber(settings['booking.minimumNoticeMinutes'], 120, 0, 10_080),
    maxAdvanceDays: clampNumber(settings['booking.maxAdvanceDays'], 90, 1, 365),
    changeCutoffHours: clampNumber(settings['booking.cancellationHours'], 2, 0, 168),
    holdMinutes: clampNumber(settings['booking.holdMinutes'], 30, 5, 60),
  };
}

export function dateIsInsideBookingWindow(
  date: string,
  timezone: string,
  policy: BookingPolicy,
  now = DateTime.utc(),
) {
  const requested = DateTime.fromISO(date, { zone: timezone }).startOf('day');
  if (!requested.isValid || requested.toFormat('yyyy-MM-dd') !== date) return false;
  const today = now.setZone(timezone).startOf('day');
  return requested >= today && requested <= today.plus({ days: policy.maxAdvanceDays });
}

export function startMeetsMinimumNotice(
  startsAt: DateTime,
  policy: BookingPolicy,
  now = DateTime.utc(),
) {
  return startsAt.toUTC() >= now.plus({ minutes: policy.minimumNoticeMinutes });
}

export function canCustomerModify(
  startsAt: Date,
  policy: Pick<BookingPolicy, 'changeCutoffHours'>,
  now = new Date(),
) {
  return startsAt.getTime() - now.getTime() >= policy.changeCutoffHours * 60 * 60 * 1000;
}

function clampNumber(value: string | undefined, fallback: number, minimum: number, maximum: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(maximum, Math.max(minimum, Math.round(parsed)));
}
