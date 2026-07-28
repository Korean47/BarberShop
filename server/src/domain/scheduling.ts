export interface MinuteRange {
  start: number;
  end: number;
}

export function rangesOverlap(left: MinuteRange, right: MinuteRange) {
  return left.start < right.end && left.end > right.start;
}

export function assertValidMinuteRange(range: MinuteRange) {
  return (
    Number.isInteger(range.start) &&
    Number.isInteger(range.end) &&
    range.start >= 0 &&
    range.end <= 24 * 60 &&
    range.start < range.end
  );
}

export function generateSlotStarts(
  schedule: MinuteRange,
  durationMinutes: number,
  intervalMinutes: number,
) {
  if (!assertValidMinuteRange(schedule) || durationMinutes <= 0 || intervalMinutes <= 0) return [];
  const values: number[] = [];
  for (let start = schedule.start; start + durationMinutes <= schedule.end; start += intervalMinutes) {
    values.push(start);
  }
  return values;
}

export function minutesToClock(minutes: number) {
  const hours = Math.floor(minutes / 60).toString().padStart(2, '0');
  const remainder = (minutes % 60).toString().padStart(2, '0');
  return `${hours}:${remainder}`;
}

export function clockToMinutes(clock: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(clock);
  if (!match) return Number.NaN;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return Number.NaN;
  return hours * 60 + minutes;
}
