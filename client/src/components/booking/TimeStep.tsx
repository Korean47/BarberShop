import { Clock3, RefreshCw } from 'lucide-react';
import type { AvailabilityResponse, AvailabilitySlot } from '../../types';
import { formatTime } from '../../utils/helpers';
import { CalendarMonth } from './CalendarMonth';

export function TimeStep({ date, onDate, availability, loading, selected, onSelect, onRefresh, maxAdvanceDays, schedules, exceptions }: {
  date: string;
  onDate(value: string): void;
  availability: AvailabilityResponse | null;
  loading: boolean;
  selected: AvailabilitySlot | null;
  onSelect(slot: AvailabilitySlot): void;
  onRefresh(): void;
  maxAdvanceDays: number;
  schedules: { dayOfWeek: number; isOpen: boolean }[];
  exceptions: { date: string; isOpen: boolean }[];
}) {
  const groups = availability?.slots.reduce<Record<string, AvailabilitySlot[]>>((result, item) => {
    const hour = Number(item.start.slice(0, 2));
    const label = hour < 12 ? 'Mañana' : hour < 18 ? 'Tarde' : 'Noche';
    (result[label] ||= []).push(item);
    return result;
  }, {}) ?? {};

  return (
    <fieldset>
      <legend className="booking-title">Fecha y hora</legend>
      <p className="booking-description">Navega por los meses disponibles y elige un horario libre.</p>
      <div className="mt-5 grid gap-5 xl:grid-cols-[minmax(300px,.9fr)_minmax(320px,1.1fr)]">
        <CalendarMonth value={date} onChange={onDate} maxAdvanceDays={maxAdvanceDays} schedules={schedules} exceptions={exceptions} />
        <div className="rounded-2xl border border-[var(--stone)] bg-[var(--surface-light)] p-4 sm:p-5">
          <div className="flex items-center justify-between gap-3"><p className="flex items-center gap-2 font-semibold"><Clock3 className="h-4 w-4 text-[var(--primary)]" /> Horarios disponibles</p><button type="button" onClick={onRefresh} disabled={loading} className="round-control" aria-label="Actualizar horarios"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button></div>
          {loading ? <div className="grid grid-cols-3 gap-2 pt-5">{Array.from({ length: 9 }, (_, index) => <div key={index} className="h-12 animate-pulse rounded-xl bg-[var(--stone)]/50" />)}</div> : availability?.slots.length ? <div className="mt-5 space-y-5">{Object.entries(groups).map(([label, items]) => <div key={label}><p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</p><div className="grid grid-cols-3 gap-2 sm:grid-cols-4">{items.map((item) => <button type="button" key={item.start} onClick={() => onSelect(item)} aria-pressed={selected?.start === item.start} className={`time-button ${selected?.start === item.start ? 'time-button-active' : ''}`}>{formatTime(item.start)}</button>)}</div></div>)}</div> : <div className="grid min-h-48 place-items-center py-8 text-center"><div><p className="font-semibold">No hay horarios disponibles</p><p className="mt-2 text-sm leading-6 text-[var(--muted)]">Selecciona otra fecha o vuelve al paso anterior para cambiar de barbero.</p></div></div>}
        </div>
      </div>
    </fieldset>
  );
}
