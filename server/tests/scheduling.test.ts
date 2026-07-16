import { describe, expect, it } from 'vitest';
import {
  clockToMinutes,
  generateSlotStarts,
  minutesToClock,
  rangesOverlap,
} from '../src/domain/scheduling.js';

describe('scheduling rules', () => {
  it('detects every overlap shape but allows adjacent appointments', () => {
    expect(rangesOverlap({ start: 600, end: 660 }, { start: 630, end: 690 })).toBe(true);
    expect(rangesOverlap({ start: 600, end: 720 }, { start: 630, end: 660 })).toBe(true);
    expect(rangesOverlap({ start: 600, end: 630 }, { start: 630, end: 660 })).toBe(false);
  });

  it('generates only slots that fit fully inside the schedule', () => {
    expect(generateSlotStarts({ start: 540, end: 660 }, 45, 15)).toEqual([540, 555, 570, 585, 600, 615]);
  });

  it('round-trips valid clock values and rejects invalid time', () => {
    expect(minutesToClock(clockToMinutes('09:45'))).toBe('09:45');
    expect(Number.isNaN(clockToMinutes('25:00'))).toBe(true);
  });
});
