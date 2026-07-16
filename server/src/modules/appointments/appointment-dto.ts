import { Prisma } from '@prisma/client';
import { DateTime } from 'luxon';

export const appointmentInclude = {
  barber: { include: { specialties: { include: { specialty: true } } } },
  customer: true,
  location: true,
  services: { orderBy: { sortOrder: 'asc' }, include: { service: { include: { category: true } } } },
  payments: { orderBy: { createdAt: 'desc' } },
  referenceImages: { select: { id: true, originalName: true, mimeType: true } },
} satisfies Prisma.AppointmentInclude;

export type AppointmentWithDetails = Prisma.AppointmentGetPayload<{
  include: typeof appointmentInclude;
}>;

export function toAppointmentDto(appointment: AppointmentWithDetails, timezone: string) {
  const start = DateTime.fromJSDate(appointment.startsAt, { zone: 'utc' }).setZone(timezone);
  const end = DateTime.fromJSDate(appointment.endsAt, { zone: 'utc' }).setZone(timezone);
  const primary = appointment.services[0];
  const payment = appointment.payments[0];

  return {
    id: appointment.id,
    date: start.startOf('day').toUTC().toISO(),
    startsAt: appointment.startsAt.toISOString(),
    endsAt: appointment.endsAt.toISOString(),
    startTime: start.toFormat('HH:mm'),
    endTime: end.toFormat('HH:mm'),
    status: appointment.status.toLowerCase(),
    notes: appointment.notes,
    totalCents: appointment.totalCents,
    currency: appointment.currency,
    barberId: appointment.barberId,
    barber: {
      id: appointment.barber.id,
      name: appointment.barber.displayName,
      email: appointment.barber.email ?? '',
      phone: appointment.barber.phone ?? '',
      photo: appointment.barber.photoUrl ?? '',
      bio: appointment.barber.bio ?? '',
      specialties: JSON.stringify(appointment.barber.specialties.map(({ specialty }) => specialty.name)),
      isActive: appointment.barber.isActive,
    },
    serviceId: primary?.serviceId ?? '',
    service: {
      id: primary?.serviceId ?? '',
      name: primary?.serviceNameSnapshot ?? 'Servicio',
      description: primary?.service.description ?? '',
      duration: appointment.services.reduce((sum, item) => sum + item.durationMinutesSnapshot, 0),
      price: appointment.totalCents / 100,
      category: primary?.service.category.name ?? 'General',
      isActive: primary?.service.isActive ?? false,
    },
    services: appointment.services.map((item) => ({
      id: item.serviceId,
      name: item.serviceNameSnapshot,
      duration: item.durationMinutesSnapshot,
      priceCents: item.priceCentsSnapshot,
    })),
    customerId: appointment.customerId,
    customer: {
      id: appointment.customer.id,
      name: appointment.customer.name,
      email: appointment.customer.email ?? '',
      phone: appointment.customer.phone,
      createdAt: appointment.customer.createdAt.toISOString(),
      updatedAt: appointment.customer.updatedAt.toISOString(),
    },
    location: {
      id: appointment.location.id,
      name: appointment.location.name,
      address: [appointment.location.addressLine1, appointment.location.city].join(', '),
    },
    payment: payment
      ? { id: payment.id, method: payment.method.toLowerCase(), status: payment.status.toLowerCase() }
      : null,
    referenceImages: appointment.referenceImages,
    createdAt: appointment.createdAt.toISOString(),
    updatedAt: appointment.updatedAt.toISOString(),
  };
}
