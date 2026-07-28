import { useMemo, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { formatDateToAPI } from '../../utils/helpers';

const weekdayLabels = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];

function fromApiDate(value: string) {
  const [year, month, day] = value.split('-').map(Number);
  return new Date(year, month - 1, day, 12);
}

function sameMonth(left: Date, right: Date) {
  return left.getFullYear() === right.getFullYear() && left.getMonth() === right.getMonth();
}

export function CalendarMonth({
  value,
  onChange,
  maxAdvanceDays,
  schedules,
  exceptions,
}: {
  value: string;
  onChange(value: string): void;
  maxAdvanceDays: number;
  schedules: { dayOfWeek: number; isOpen: boolean }[];
  exceptions: { date: string; isOpen: boolean }[];
}) {
  const selected = fromApiDate(value);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1, 12));
  const today = useMemo(() => { const date = new Date(); date.setHours(12, 0, 0, 0); return date; }, []);
  const maxDate = useMemo(() => { const date = new Date(today); date.setDate(date.getDate() + maxAdvanceDays); return date; }, [maxAdvanceDays, today]);
  const cells = useMemo(() => {
    const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1, 12);
    const mondayOffset = (first.getDay() + 6) % 7;
    const start = new Date(first);
    start.setDate(start.getDate() - mondayOffset);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return date;
    });
  }, [visibleMonth]);

  function isAvailable(date: Date) {
    if (date < today || date > maxDate) return false;
    const apiDate = formatDateToAPI(date);
    const exception = exceptions.find((item) => item.date.slice(0, 10) === apiDate);
    if (exception) return exception.isOpen;
    return schedules.find((item) => item.dayOfWeek === date.getDay())?.isOpen ?? false;
  }

  function focusDate(date: Date) {
    const apiDate = formatDateToAPI(date);
    if (!sameMonth(date, visibleMonth)) setVisibleMonth(new Date(date.getFullYear(), date.getMonth(), 1, 12));
    window.requestAnimationFrame(() => document.querySelector<HTMLButtonElement>(`[data-calendar-date="${apiDate}"]`)?.focus());
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>, date: Date) {
    const offsets: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (event.key in offsets) {
      event.preventDefault();
      const target = new Date(date);
      target.setDate(target.getDate() + offsets[event.key]);
      focusDate(target);
    } else if (event.key === 'PageUp' || event.key === 'PageDown') {
      event.preventDefault();
      const target = new Date(date);
      target.setMonth(target.getMonth() + (event.key === 'PageUp' ? -1 : 1));
      focusDate(target);
    }
  }

  const canPrevious = visibleMonth > new Date(today.getFullYear(), today.getMonth(), 1, 12);
  const canNext = visibleMonth < new Date(maxDate.getFullYear(), maxDate.getMonth(), 1, 12);
  const monthLabel = visibleMonth.toLocaleDateString('es-MX', { month: 'long', year: 'numeric' });
  const selectedIsFocusable = cells.some((date) => formatDateToAPI(date) === value && sameMonth(date, visibleMonth) && isAvailable(date));
  const focusableDate = selectedIsFocusable
    ? value
    : formatDateToAPI(cells.find((date) => sameMonth(date, visibleMonth) && isAvailable(date)) ?? visibleMonth);

  return (
    <div className="calendar" aria-label="Calendario de disponibilidad">
      <div className="flex items-center justify-between gap-3">
        <button type="button" className="round-control" onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() - 1, 1, 12))} disabled={!canPrevious} aria-label="Mes anterior"><ChevronLeft className="h-5 w-5" /></button>
        <p className="capitalize font-semibold" aria-live="polite">{monthLabel}</p>
        <button type="button" className="round-control" onClick={() => setVisibleMonth((current) => new Date(current.getFullYear(), current.getMonth() + 1, 1, 12))} disabled={!canNext} aria-label="Mes siguiente"><ChevronRight className="h-5 w-5" /></button>
      </div>
      <div className="mt-4 grid grid-cols-7" role="row">{weekdayLabels.map((label) => <span key={label} role="columnheader" className="py-2 text-center text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</span>)}</div>
      <div className="grid grid-cols-7 gap-1" role="grid">
        {cells.map((date) => {
          const apiDate = formatDateToAPI(date);
          const outside = !sameMonth(date, visibleMonth);
          const available = isAvailable(date) && !outside;
          const active = apiDate === value;
          const current = apiDate === formatDateToAPI(today);
          return (
            <button
              type="button"
              role="gridcell"
              key={apiDate}
              data-calendar-date={apiDate}
              aria-label={date.toLocaleDateString('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              aria-current={current ? 'date' : undefined}
              aria-pressed={active}
              disabled={!available}
              tabIndex={apiDate === focusableDate ? 0 : -1}
              onKeyDown={(event) => onKeyDown(event, date)}
              onClick={() => onChange(apiDate)}
              className={`calendar-day ${active ? 'calendar-day-active' : ''} ${current ? 'calendar-day-today' : ''} ${outside ? 'invisible' : ''}`}
            >{date.getDate()}</button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--muted)]"><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-[var(--accent)]" /> Seleccionado</span><span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full border border-[var(--stone)] bg-white" /> Disponible</span><span>Los días cerrados aparecen deshabilitados.</span></div>
    </div>
  );
}
