import { Clock3, RefreshCw } from 'lucide-react';
import type { AvailabilityResponse, AvailabilitySlot } from '../../types';
import { formatDateToAPI, formatTime } from '../../utils/helpers';

function datesFromToday() {
  return Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setHours(12, 0, 0, 0);
    date.setDate(date.getDate() + index);
    return date;
  });
}

export function TimeStep({ date, onDate, availability, loading, selected, onSelect, onRefresh }: {
  date: string;
  onDate(value: string): void;
  availability: AvailabilityResponse | null;
  loading: boolean;
  selected: AvailabilitySlot | null;
  onSelect(slot: AvailabilitySlot): void;
  onRefresh(): void;
}) {
  const dates = datesFromToday();
  return (
    <fieldset>
      <legend className="font-display text-3xl font-semibold text-[#17211d]">¿Cuándo te queda bien?</legend>
      <p className="mt-2 text-sm text-[#657069]">Todos los horarios se muestran en la hora local de la barbería.</p>
      <div className="-mx-4 mt-7 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
        <div className="flex min-w-max gap-2" role="list" aria-label="Fechas disponibles">
          {dates.map((item, index) => {
            const value = formatDateToAPI(item);
            const active = value === date;
            return (
              <button
                type="button"
                key={value}
                aria-pressed={active}
                onClick={() => onDate(value)}
                className={`w-[74px] rounded-2xl border px-2 py-3 text-center transition ${active ? 'border-[var(--brand-dark)] bg-[var(--brand-dark)] text-white' : 'border-[#17211d]/10 bg-white text-[#17211d] hover:border-[#17211d]/25'}`}
              >
                <span className="block text-[10px] font-bold uppercase tracking-wider opacity-70">{index === 0 ? 'Hoy' : item.toLocaleDateString('es-MX', { weekday: 'short' })}</span>
                <span className="mt-1 block text-xl font-bold">{item.getDate()}</span>
                <span className="block text-[10px] uppercase opacity-70">{item.toLocaleDateString('es-MX', { month: 'short' })}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-7 rounded-2xl border border-[#17211d]/10 bg-white p-5">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-sm font-bold"><Clock3 className="h-4 w-4 text-[var(--brand)]" /> Horarios disponibles</h2>
          <button type="button" onClick={onRefresh} className="rounded-full p-2 text-[#657069] hover:bg-[#17211d]/5" aria-label="Actualizar horarios"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button>
        </div>
        {loading ? (
          <div className="grid grid-cols-3 gap-2 pt-5 sm:grid-cols-5" aria-label="Consultando horarios">
            {Array.from({ length: 10 }, (_, index) => <span key={index} className="h-11 animate-pulse rounded-xl bg-[#17211d]/5" />)}
          </div>
        ) : availability?.slots.length ? (
          <div className="grid grid-cols-3 gap-2 pt-5 sm:grid-cols-5">
            {availability.slots.map((slot) => {
              const active = selected?.start === slot.start;
              return (
                <button type="button" key={slot.start} aria-pressed={active} onClick={() => onSelect(slot)} className={`min-h-11 rounded-xl border text-sm font-bold transition ${active ? 'border-[var(--brand)] bg-[var(--brand-soft)] text-[#17211d]' : 'border-[#17211d]/10 hover:border-[#17211d]/30'}`}>
                  {formatTime(slot.start)}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="py-10 text-center">
            <p className="font-semibold text-[#17211d]">No quedan horarios este día</p>
            <p className="mt-1 text-sm text-[#657069]">Prueba con la siguiente fecha o con cualquier barbero.</p>
          </div>
        )}
      </div>
    </fieldset>
  );
}
