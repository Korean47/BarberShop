import { randomUUID } from 'node:crypto';
import { AppointmentStatus, PaymentStatus, Prisma } from '@prisma/client';
import { DateTime } from 'luxon';
import { prisma } from '../../utils/prisma.js';
import { env } from '../../config/env.js';
import { canTransitionAppointment } from '../../domain/appointment-status.js';
import { clockToMinutes } from '../../domain/scheduling.js';
import { evaluateSubscriptionAccess } from '../subscriptions/subscription-policy.js';
import { getPaymentProvider } from '../payments/provider-registry.js';
import { randomToken, sha256 } from '../../shared/crypto.js';
import { badRequest, conflict, forbidden, notFound } from '../../shared/errors.js';
import { findAvailability } from '../availability/availability-service.js';
import { appointmentInclude, toAppointmentDto } from './appointment-dto.js';
import type { CreateBookingInput, ManageAppointmentInput } from './booking-schemas.js';

const terminalStatuses: AppointmentStatus[] = ['COMPLETED', 'CANCELLED', 'NO_SHOW'];

interface TenantInput {
  id: string;
  slug: string;
  timezone: string;
  currency: string;
}

export async function createBooking(tenant: TenantInput, input: CreateBookingInput) {
  const availability = await findAvailability({
    tenantId: tenant.id,
    timezone: tenant.timezone,
    date: input.date,
    serviceIds: input.serviceIds,
    barberId: input.barberId ?? undefined,
    locationId: input.locationId,
  });
  const requestedSlot = availability.slots.find((slot) => slot.start === input.startTime);
  if (!requestedSlot) {
    throw conflict('SLOT_UNAVAILABLE', 'Ese horario acaba de ocuparse. Elige uno de los horarios disponibles.');
  }

  const quotedServices = await prisma.service.findMany({
    where: { id: { in: input.serviceIds }, tenantId: tenant.id, isActive: true },
    select: { priceCents: true },
  });
  if (quotedServices.length !== input.serviceIds.length) {
    throw badRequest('INVALID_SERVICE', 'Uno de los servicios ya no está disponible');
  }
  const quotedTotalCents = quotedServices.reduce((sum, service) => sum + service.priceCents, 0);
  const appointmentId = randomUUID();
  const managementToken = randomToken();
  const idempotencyKey = `booking:${appointmentId}`;
  const onlinePayment = input.paymentMethod === 'ONLINE'
    ? await getPaymentProvider().createPayment({
        appointmentId,
        amountCents: quotedTotalCents,
        currency: tenant.currency,
        idempotencyKey,
      })
    : null;

  const created = await prisma.$transaction(async (tx) => {
    const subscription = await tx.subscription.findUnique({
      where: { tenantId: tenant.id },
      include: { tenant: { select: { status: true } } },
    });
    const access = evaluateSubscriptionAccess({
      tenantStatus: subscription?.tenant.status ?? 'SUSPENDED',
      subscriptionStatus: subscription?.status ?? null,
      graceEndsAt: subscription?.graceEndsAt ?? null,
    });
    if (!access.allowed) throw forbidden('SUBSCRIPTION_REQUIRED', 'La agenda está pausada temporalmente');

    const services = await tx.service.findMany({
      where: { id: { in: input.serviceIds }, tenantId: tenant.id, isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
    if (services.length !== input.serviceIds.length) throw badRequest('INVALID_SERVICE', 'Uno de los servicios ya no está disponible');

    const location = await tx.location.findFirst({
      where: {
        id: availability.location.id,
        tenantId: tenant.id,
        isActive: true,
      },
    });
    if (!location) throw notFound('Sucursal');

    const totalCents = services.reduce((sum, service) => sum + service.priceCents, 0);
    const durationMinutes = services.reduce(
      (sum, service) => sum + service.bufferBeforeMinutes + service.durationMinutes + service.bufferAfterMinutes,
      0,
    );
    const startsAt = DateTime.fromISO(`${input.date}T${input.startTime}`, { zone: tenant.timezone });
    if (!startsAt.isValid) throw badRequest('INVALID_DATE', 'La fecha u hora no es válida');
    const endsAt = startsAt.plus({ minutes: durationMinutes });

    const candidateIds = requestedSlot.availableBarbers.map((barber) => barber.id);
    const barber = await selectAvailableBarber(tx, tenant.id, candidateIds, startsAt.toUTC().toJSDate(), endsAt.toUTC().toJSDate());
    if (!barber) throw conflict('SLOT_UNAVAILABLE', 'Ese horario acaba de ocuparse. Elige otro horario.');

    const customer = await tx.customer.upsert({
      where: { tenantId_phone: { tenantId: tenant.id, phone: input.customer.phone } },
      update: {
        name: input.customer.name,
        email: input.customer.email || null,
        consentedAt: new Date(),
      },
      create: {
        tenantId: tenant.id,
        name: input.customer.name,
        phone: input.customer.phone,
        email: input.customer.email || null,
        consentedAt: new Date(),
      },
    });

    const status: AppointmentStatus = input.paymentMethod === 'CASH' ? 'CONFIRMED' : 'PENDING';
    const expiresAt = DateTime.min(endsAt.plus({ days: 7 }), DateTime.utc().plus({ days: 30 })).toJSDate();
    const recipient = input.customer.email || input.customer.phone;
    const channel = input.customer.email ? 'EMAIL' : 'SMS';

    return tx.appointment.create({
      data: {
        id: appointmentId,
        tenantId: tenant.id,
        locationId: location.id,
        barberId: barber.id,
        customerId: customer.id,
        startsAt: startsAt.toUTC().toJSDate(),
        endsAt: endsAt.toUTC().toJSDate(),
        status,
        notes: input.customer.notes,
        totalCents,
        currency: tenant.currency,
        managementTokenHash: sha256(managementToken),
        managementTokenExpiresAt: expiresAt,
        services: {
          create: services.map((service, index) => ({
            serviceId: service.id,
            serviceNameSnapshot: service.name,
            durationMinutesSnapshot: service.durationMinutes,
            priceCentsSnapshot: service.priceCents,
            sortOrder: index,
          })),
        },
        statusHistory: { create: { toStatus: status, reason: 'Reserva creada por cliente' } },
        payments: {
          create: {
            tenantId: tenant.id,
            method: input.paymentMethod,
            status: PaymentStatus.PENDING,
            amountCents: totalCents,
            currency: tenant.currency,
            provider: onlinePayment ? getPaymentProvider().name : null,
            providerPaymentId: onlinePayment?.providerPaymentId,
            attempts: onlinePayment
              ? { create: { idempotencyKey, status: PaymentStatus.PENDING } }
              : undefined,
          },
        },
        notifications: {
          create: {
            tenantId: tenant.id,
            channel,
            recipient,
            templateKey: 'appointment.confirmation',
            idempotencyKey: `appointment:${appointmentId}:confirmation:${channel}`,
            scheduledAt: new Date(),
          },
        },
      },
      include: appointmentInclude,
    });
  }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });

  return {
    appointment: toAppointmentDto(created, tenant.timezone),
    manageToken: managementToken,
    manageUrl: `${env.PUBLIC_APP_URL}/manage/${managementToken}`,
    payment: onlinePayment ? { clientSecret: onlinePayment.clientSecret, provider: getPaymentProvider().name } : null,
  };
}

async function selectAvailableBarber(
  tx: Prisma.TransactionClient,
  tenantId: string,
  candidateIds: string[],
  startsAt: Date,
  endsAt: Date,
) {
  for (const id of candidateIds) {
    const barber = await tx.barberProfile.findFirst({
      where: {
        id,
        tenantId,
        isActive: true,
        appointments: {
          none: {
            startsAt: { lt: endsAt },
            endsAt: { gt: startsAt },
            status: { in: ['PENDING', 'CONFIRMED', 'CHECKED_IN', 'IN_PROGRESS'] },
          },
        },
        timeOff: { none: { startsAt: { lt: endsAt }, endsAt: { gt: startsAt } } },
      },
      select: { id: true },
    });
    if (barber) return barber;
  }
  return null;
}

export async function getManagedAppointment(tenantId: string, timezone: string, token: string) {
  const appointment = await findByManagementToken(tenantId, token);
  return toAppointmentDto(appointment, timezone);
}

export async function manageAppointment(
  tenant: TenantInput,
  token: string,
  input: ManageAppointmentInput,
) {
  const appointment = await findByManagementToken(tenant.id, token);
  if (terminalStatuses.includes(appointment.status)) {
    throw conflict('APPOINTMENT_FINAL', 'Esta cita ya no se puede modificar');
  }

  if (input.action === 'cancel') {
    if (!canTransitionAppointment(appointment.status, 'CANCELLED')) {
      throw conflict('INVALID_STATUS', 'La cita ya no se puede cancelar');
    }
    const updated = await prisma.appointment.update({
      where: { id: appointment.id, tenantId: tenant.id },
      data: {
        status: 'CANCELLED',
        version: { increment: 1 },
        statusHistory: {
          create: { fromStatus: appointment.status, toStatus: 'CANCELLED', reason: input.reason ?? 'Cancelada por cliente' },
        },
      },
      include: appointmentInclude,
    });
    return toAppointmentDto(updated, tenant.timezone);
  }

  const serviceIds = appointment.services.map((service) => service.serviceId);
  const availability = await findAvailability({
    tenantId: tenant.id,
    timezone: tenant.timezone,
    date: input.date,
    serviceIds,
    barberId: appointment.barberId,
    locationId: appointment.locationId,
    excludeAppointmentId: appointment.id,
  });
  const slot = availability.slots.find((item) => item.start === input.startTime);
  if (!slot) throw conflict('SLOT_UNAVAILABLE', 'Ese horario no está disponible. Elige otro.');

  const duration = Math.round((appointment.endsAt.getTime() - appointment.startsAt.getTime()) / 60_000);
  const startsAt = DateTime.fromISO(`${input.date}T${input.startTime}`, { zone: tenant.timezone });
  const updated = await prisma.appointment.update({
    where: { id: appointment.id, tenantId: tenant.id },
    data: {
      startsAt: startsAt.toUTC().toJSDate(),
      endsAt: startsAt.plus({ minutes: duration }).toUTC().toJSDate(),
      version: { increment: 1 },
    },
    include: appointmentInclude,
  });
  return toAppointmentDto(updated, tenant.timezone);
}

export async function findByManagementToken(tenantId: string, token: string) {
  if (token.length < 32 || token.length > 100) throw notFound('Cita');
  const appointment = await prisma.appointment.findFirst({
    where: {
      tenantId,
      managementTokenHash: sha256(token),
      managementTokenExpiresAt: { gt: new Date() },
    },
    include: appointmentInclude,
  });
  if (!appointment) throw notFound('Cita');
  return appointment;
}

export function assertClock(clock: string) {
  if (Number.isNaN(clockToMinutes(clock))) throw badRequest('INVALID_TIME', 'Selecciona un horario válido');
}
