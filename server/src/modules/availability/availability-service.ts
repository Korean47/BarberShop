import { AppointmentStatus } from '@prisma/client';
import { DateTime } from 'luxon';
import { prisma } from '../../utils/prisma.js';
import { badRequest, notFound } from '../../shared/errors.js';
import { generateSlotStarts, minutesToClock, rangesOverlap } from '../../domain/scheduling.js';
import {
  bookingPolicyFromSettings,
  dateIsInsideBookingWindow,
  startMeetsMinimumNotice,
} from '../../domain/booking-policy.js';
import { releaseExpiredPaymentHolds } from '../payments/payment-holds.js';

const activeStatuses: AppointmentStatus[] = ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'];

interface AvailabilityInput {
  tenantId: string;
  timezone: string;
  date: string;
  serviceIds: string[];
  barberId?: string;
  locationId?: string;
  excludeAppointmentId?: string;
}

export async function findAvailability(input: AvailabilityInput) {
  await releaseExpiredPaymentHolds(input.tenantId);
  const localDate = DateTime.fromISO(input.date, { zone: input.timezone });
  if (!localDate.isValid || localDate.toFormat('yyyy-MM-dd') !== input.date) {
    throw badRequest('INVALID_DATE', 'Selecciona una fecha válida');
  }

  const [services, location, settingRows] = await Promise.all([
    prisma.service.findMany({
      where: { id: { in: input.serviceIds }, tenantId: input.tenantId, isActive: true },
    }),
    prisma.location.findFirst({
      where: {
        tenantId: input.tenantId,
        isActive: true,
        ...(input.locationId ? { id: input.locationId } : {}),
      },
      orderBy: { isDefault: 'desc' },
    }),
    prisma.tenantSetting.findMany({
      where: { tenantId: input.tenantId, key: { startsWith: 'booking.' } },
      select: { key: true, value: true },
    }),
  ]);

  if (services.length !== new Set(input.serviceIds).size) throw badRequest('INVALID_SERVICE', 'Uno de los servicios ya no está disponible');
  if (!location) throw notFound('Sucursal');

  const settings = Object.fromEntries(settingRows.map(({ key, value }) => [key, value]));
  const policy = bookingPolicyFromSettings(settings);
  if (!dateIsInsideBookingWindow(input.date, input.timezone, policy)) {
    throw badRequest('DATE_OUTSIDE_BOOKING_WINDOW', 'Selecciona una fecha dentro de la ventana de reservación');
  }

  const dayOfWeek = localDate.weekday % 7;
  const dayStart = localDate.startOf('day').toUTC().toJSDate();
  const dayEnd = localDate.endOf('day').toUTC().toJSDate();
  const durationMinutes = services.reduce(
    (sum, service) => sum + service.bufferBeforeMinutes + service.durationMinutes + service.bufferAfterMinutes,
    0,
  );
  const slotInterval = Math.max(5, Number(settings['booking.slotIntervalMinutes'] ?? 15));

  const [businessSchedule, scheduleException, barbers] = await Promise.all([
    prisma.businessSchedule.findUnique({
      where: { locationId_dayOfWeek: { locationId: location.id, dayOfWeek } },
    }),
    prisma.locationScheduleException.findUnique({
      where: {
        locationId_date: {
          locationId: location.id,
          date: new Date(`${input.date}T00:00:00.000Z`),
        },
      },
    }),
    prisma.barberProfile.findMany({
      where: {
        tenantId: input.tenantId,
        isActive: true,
        ...(input.barberId ? { id: input.barberId } : {}),
      },
      include: {
        services: { where: { serviceId: { in: input.serviceIds } }, select: { serviceId: true } },
        schedules: {
          where: { locationId: location.id, dayOfWeek, isWorking: true },
          include: { breaks: true },
        },
        appointments: {
          where: {
            startsAt: { lt: dayEnd },
            endsAt: { gt: dayStart },
            OR: [
              { status: { in: activeStatuses.filter((status) => status !== 'PENDING') } },
              { status: 'PENDING', OR: [{ holdExpiresAt: null }, { holdExpiresAt: { gt: new Date() } }] },
            ],
            ...(input.excludeAppointmentId ? { id: { not: input.excludeAppointmentId } } : {}),
          },
          select: { startsAt: true, endsAt: true },
        },
        timeOff: {
          where: { startsAt: { lt: dayEnd }, endsAt: { gt: dayStart } },
          select: { startsAt: true, endsAt: true },
        },
      },
      orderBy: { displayName: 'asc' },
    }),
  ]);

  if (scheduleException && !scheduleException.isOpen) {
    return { date: input.date, dayOff: true, closureLabel: scheduleException.label, durationMinutes, slots: [], location };
  }
  if (!businessSchedule?.isOpen && !scheduleException?.isOpen) {
    return { date: input.date, dayOff: true, closureLabel: null, durationMinutes, slots: [], location };
  }

  const businessWindow = scheduleException?.isOpen && scheduleException.startMinute !== null && scheduleException.endMinute !== null
    ? { startMinute: scheduleException.startMinute, endMinute: scheduleException.endMinute }
    : businessSchedule;
  if (!businessWindow) return { date: input.date, dayOff: true, closureLabel: scheduleException?.label ?? null, durationMinutes, slots: [], location };

  const qualified = barbers.filter((barber) => barber.services.length === new Set(input.serviceIds).size);
  if (input.barberId && qualified.length === 0) throw badRequest('BARBER_UNAVAILABLE', 'El barbero no realiza todos los servicios elegidos');

  const grouped = new Map<string, { start: string; end: string; availableBarbers: { id: string; name: string }[] }>();
  const now = DateTime.utc();

  for (const barber of qualified) {
    const schedule = barber.schedules[0];
    if (!schedule) continue;
    const window = {
      start: Math.max(schedule.startMinute, businessWindow.startMinute),
      end: Math.min(schedule.endMinute, businessWindow.endMinute),
    };

    for (const minute of generateSlotStarts(window, durationMinutes, slotInterval)) {
      const slotLocalStart = localDate.startOf('day').plus({ minutes: minute });
      const slotLocalEnd = slotLocalStart.plus({ minutes: durationMinutes });
      if (!startMeetsMinimumNotice(slotLocalStart, policy, now)) continue;

      const minuteRange = { start: minute, end: minute + durationMinutes };
      const hitsBreak = schedule.breaks.some((item) =>
        rangesOverlap(minuteRange, { start: item.startMinute, end: item.endMinute }),
      );
      const hitsAppointment = barber.appointments.some((item) =>
        slotLocalStart.toUTC().toMillis() < item.endsAt.getTime() &&
        slotLocalEnd.toUTC().toMillis() > item.startsAt.getTime(),
      );
      const hitsTimeOff = barber.timeOff.some((item) =>
        slotLocalStart.toUTC().toMillis() < item.endsAt.getTime() &&
        slotLocalEnd.toUTC().toMillis() > item.startsAt.getTime(),
      );
      if (hitsBreak || hitsAppointment || hitsTimeOff) continue;

      const start = minutesToClock(minute);
      const end = minutesToClock(minute + durationMinutes);
      const existing = grouped.get(start) ?? { start, end, availableBarbers: [] };
      existing.availableBarbers.push({ id: barber.id, name: barber.displayName });
      grouped.set(start, existing);
    }
  }

  return {
    date: input.date,
    dayOff: false,
    closureLabel: scheduleException?.label ?? null,
    durationMinutes,
    location: { id: location.id, name: location.name },
    slots: [...grouped.values()].sort((left, right) => left.start.localeCompare(right.start)),
  };
}
