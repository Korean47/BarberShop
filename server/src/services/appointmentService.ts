import { prisma } from '../utils/prisma.js';
import { AppError } from '../middleware/errorHandler.js';
import { timeToMinutes, getDayName } from '../utils/dateUtils.js';

interface CreateAppointmentInput {
  barberId: string;
  serviceId: string;
  date: string;
  startTime: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  notes?: string;
}

interface UpdateAppointmentInput {
  startTime?: string;
  endTime?: string;
  serviceId?: string;
  status?: string;
  notes?: string;
}

export async function listAppointments(filters?: {
  date?: string;
  barberId?: string;
  status?: string;
}) {
  const where: Record<string, unknown> = {};

  if (filters?.barberId) {
    where.barberId = filters.barberId;
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.date) {
    const startOfDay = new Date(filters.date + 'T00:00:00.000Z');
    const endOfDay = new Date(filters.date + 'T23:59:59.999Z');
    where.date = { gte: startOfDay, lte: endOfDay };
  }

  return prisma.appointment.findMany({
    where,
    include: {
      barber: true,
      service: true,
      customer: true,
    },
    orderBy: [{ date: 'asc' }, { startTime: 'asc' }],
  });
}

export async function getAppointmentById(id: string) {
  const appointment = await prisma.appointment.findUnique({
    where: { id },
    include: {
      barber: true,
      service: true,
      customer: true,
    },
  });

  if (!appointment) throw new AppError(404, 'Appointment not found');
  return appointment;
}

export async function createAppointment(input: CreateAppointmentInput) {
  // Validate barber exists
  const barber = await prisma.barber.findUnique({ where: { id: input.barberId } });
  if (!barber) throw new AppError(404, 'Barber not found');

  // Validate service exists
  const service = await prisma.service.findUnique({ where: { id: input.serviceId } });
  if (!service) throw new AppError(404, 'Service not found');

  // Calculate end time from service duration
  const startMinutes = timeToMinutes(input.startTime);
  const endMinutes = startMinutes + service.duration;
  const endTime = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`;

  const appointmentDate = new Date(input.date + 'T00:00:00.000Z');

  // Check work schedule
  const dayName = getDayName(appointmentDate);
  const schedule = JSON.parse(barber.workSchedule);
  const daySchedule = schedule[dayName];
  if (!daySchedule) throw new AppError(400, 'Barber does not work on this day');
  
  const workStartMins = timeToMinutes(daySchedule.start);
  const workEndMins = timeToMinutes(daySchedule.end);
  if (startMinutes < workStartMins || endMinutes > workEndMins) {
    throw new AppError(400, 'Appointment is outside barber work hours');
  }

  // Check for conflicts
  const endOfDay = new Date(input.date + 'T23:59:59.999Z');

  const conflicts = await prisma.appointment.findMany({
    where: {
      barberId: input.barberId,
      date: { gte: appointmentDate, lte: endOfDay },
      status: { in: ['confirmed', 'pending'] },
    },
  });

  const hasConflict = conflicts.some((appt) => {
    const apptStart = timeToMinutes(appt.startTime);
    const apptEnd = timeToMinutes(appt.endTime);
    return startMinutes < apptEnd && endMinutes > apptStart;
  });

  if (hasConflict) {
    throw new AppError(409, 'Time slot is already booked');
  }

  // Find or create customer
  let customer = await prisma.customer.findUnique({
    where: { email: input.customerEmail },
  });

  if (!customer) {
    customer = await prisma.customer.create({
      data: {
        name: input.customerName,
        email: input.customerEmail,
        phone: input.customerPhone,
      },
    });
  }

  // Create appointment
  return prisma.appointment.create({
    data: {
      date: appointmentDate,
      startTime: input.startTime,
      endTime,
      status: 'confirmed',
      notes: input.notes,
      barberId: input.barberId,
      serviceId: input.serviceId,
      customerId: customer.id,
    },
    include: {
      barber: true,
      service: true,
      customer: true,
    },
  });
}

export async function updateAppointment(id: string, input: UpdateAppointmentInput) {
  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Appointment not found');

  let newStartTime = input.startTime || existing.startTime;
  let newEndTime = existing.endTime;

  if (input.serviceId || input.startTime) {
    const serviceIdToUse = input.serviceId || existing.serviceId;
    const service = await prisma.service.findUnique({ where: { id: serviceIdToUse } });
    if (!service) throw new AppError(404, 'Service not found');

    const startMinutes = timeToMinutes(newStartTime);
    const endMinutes = startMinutes + service.duration;
    newEndTime = `${Math.floor(endMinutes / 60).toString().padStart(2, '0')}:${(endMinutes % 60).toString().padStart(2, '0')}`;
  }

  // Check for conflicts if time or status changing to active
  if (
    input.startTime || 
    input.serviceId || 
    (input.status && ['confirmed', 'pending'].includes(input.status) && existing.status === 'cancelled')
  ) {
    const startOfDay = new Date(existing.date);
    startOfDay.setUTCHours(0,0,0,0);
    const endOfDay = new Date(existing.date);
    endOfDay.setUTCHours(23,59,59,999);

    const conflicts = await prisma.appointment.findMany({
      where: {
        barberId: existing.barberId,
        date: { gte: startOfDay, lte: endOfDay },
        status: { in: ['confirmed', 'pending'] },
        id: { not: id } // exclude self
      },
    });

    const startMins = timeToMinutes(newStartTime);
    const endMins = timeToMinutes(newEndTime);
    
    const hasConflict = conflicts.some((appt) => {
      const apptStart = timeToMinutes(appt.startTime);
      const apptEnd = timeToMinutes(appt.endTime);
      return startMins < apptEnd && endMins > apptStart;
    });

    if (hasConflict) {
      throw new AppError(409, 'Time slot is already booked or overlaps with existing appointment');
    }
  }

  return prisma.appointment.update({
    where: { id },
    data: {
      startTime: newStartTime,
      endTime: newEndTime,
      ...(input.serviceId && { serviceId: input.serviceId }),
      ...(input.status && { status: input.status }),
      ...(input.notes !== undefined && { notes: input.notes }),
    },
    include: {
      barber: true,
      service: true,
      customer: true,
    },
  });
}

export async function cancelAppointment(id: string) {
  const existing = await prisma.appointment.findUnique({ where: { id } });
  if (!existing) throw new AppError(404, 'Appointment not found');

  return prisma.appointment.update({
    where: { id },
    data: { status: 'cancelled' },
    include: {
      barber: true,
      service: true,
      customer: true,
    },
  });
}
