/**
 * Parse a time string "HH:MM" into total minutes from midnight.
 */
export function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

/**
 * Convert minutes from midnight back to "HH:MM" format.
 */
export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

/**
 * Get the day-of-week name (lowercase) for a given date.
 */
export function getDayName(date: Date): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[date.getUTCDay()];
}

/**
 * Generate time slots between start and end with a given interval (in minutes).
 * Returns array of { start, end } time strings.
 */
export function generateTimeSlots(
  startTime: string,
  endTime: string,
  intervalMinutes: number
): { start: string; end: string }[] {
  const slots: { start: string; end: string }[] = [];
  let current = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  while (current + intervalMinutes <= end) {
    slots.push({
      start: minutesToTime(current),
      end: minutesToTime(current + intervalMinutes),
    });
    current += intervalMinutes;
  }

  return slots;
}
