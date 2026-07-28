import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CalendarMonth } from './CalendarMonth';

describe('CalendarMonth', () => {
  beforeEach(() => { vi.useFakeTimers(); vi.setSystemTime(new Date('2026-07-17T12:00:00')); });
  afterEach(() => { cleanup(); vi.useRealTimers(); });

  it('disables closed days and respects an opening exception', () => {
    render(<CalendarMonth value="2026-07-17" onChange={() => undefined} maxAdvanceDays={90} schedules={[1, 2, 3, 4, 5].map((dayOfWeek) => ({ dayOfWeek, isOpen: true }))} exceptions={[{ date: '2026-07-19T00:00:00.000Z', isOpen: true }]} />);
    expect(screen.getByRole('gridcell', { name: /sábado, 18 de julio/i })).toBeDisabled();
    expect(screen.getByRole('gridcell', { name: /domingo, 19 de julio/i })).toBeEnabled();
  });

  it('navigates months and selects an available day', () => {
    const onChange = vi.fn();
    render(<CalendarMonth value="2026-07-17" onChange={onChange} maxAdvanceDays={90} schedules={Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, isOpen: true }))} exceptions={[]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Mes siguiente' }));
    expect(screen.getByText(/agosto de 2026/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('gridcell', { name: /lunes, 3 de agosto/i }));
    expect(onChange).toHaveBeenCalledWith('2026-08-03');
  });

  it('keeps one available day in the keyboard tab order after changing month', () => {
    render(<CalendarMonth value="2026-07-17" onChange={() => undefined} maxAdvanceDays={90} schedules={Array.from({ length: 7 }, (_, dayOfWeek) => ({ dayOfWeek, isOpen: true }))} exceptions={[]} />);
    fireEvent.click(screen.getByRole('button', { name: 'Mes siguiente' }));
    expect(screen.getByRole('gridcell', { name: /sábado, 1 de agosto/i })).toHaveAttribute('tabindex', '0');
  });
});
