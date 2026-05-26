import { prisma } from '../utils/prisma.js';
import { getDayName, timeToMinutes, generateTimeSlots } from '../utils/dateUtils.js';
import { AppError } from '../middleware/errorHandler.js';

interface WorkScheduleDay {
  start: string;
  end: string;
}

type WorkSchedule = Record<string, WorkScheduleDay>;

/**
 * Get available time slots for a barber on a specific date,
 * given a service duration. Filters out already-booked slots.
 */
export async function getAvailability(
  barberId: string,
  dateStr: string,
  serviceDuration: number = 30
) {
  const barber = await prisma.barber.findUnique({ where: { id: barberId } });
  if (!barber) throw new AppError(404, 'Barber not found');

  const schedule: WorkSchedule = JSON.parse(barber.workSchedule);
  const date = new Date(dateStr + 'T00:00:00.000Z');
  const dayName = getDayName(date);

  // Check if barber works on this day
  const daySchedule = schedule[dayName];
  if (!daySchedule) {
    return { barberId, date: dateStr, dayOff: true, slots: [] };
  }

  // Generate all possible time slots
  const allSlots = generateTimeSlots(daySchedule.start, daySchedule.end, serviceDuration);

  // Get existing appointments for this barber on this date
  const startOfDay = new Date(dateStr + 'T00:00:00.000Z');
  const endOfDay = new Date(dateStr + 'T23:59:59.999Z');

  const bookedAppointments = await prisma.appointment.findMany({
    where: {
      barberId,
      date: { gte: startOfDay, lte: endOfDay },
      status: { in: ['confirmed', 'pending'] },
    },
    select: { startTime: true, endTime: true },
  });

  // Filter out slots that overlap with booked appointments
  const availableSlots = allSlots.filter((slot) => {
    const slotStart = timeToMinutes(slot.start);
    const slotEnd = timeToMinutes(slot.end);

    return !bookedAppointments.some((appt) => {
      const apptStart = timeToMinutes(appt.startTime);
      const apptEnd = timeToMinutes(appt.endTime);
      // Overlap check: slot overlaps if it starts before appt ends AND ends after appt starts
      return slotStart < apptEnd && slotEnd > apptStart;
    });
  });

  return {
    barberId,
    date: dateStr,
    dayOff: false,
    workStart: daySchedule.start,
    workEnd: daySchedule.end,
    slots: availableSlots,
    totalSlots: allSlots.length,
    availableCount: availableSlots.length,
  };
}
