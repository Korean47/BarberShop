import { Clock3, RefreshCw } from 'lucide-react';
import type { AvailabilityResponse, AvailabilitySlot } from '../../types';
import { formatDateToAPI, formatTime } from '../../utils/helpers';

function datesFromToday() {
  return Array.from({ length: 7 }, (_, index) => {
    const value = new Date();
    value.setHours(12, 0, 0, 0);
    value.setDate(value.getDate() + index);
    return value;
  });
}

function dayLabel(value: Date, index: number) {
  if (index === 0) return 'Hoy';
  if (index === 1) return 'Mañana';
  return value.toLocaleDateString('es-MX', { weekday: 'short' }).replace('.', '');
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
      <legend className="text-2xl font-black tracking-tight text-[#17313a] sm:text-3xl">Elige día y hora</legend>
      <p className="mt-2 text-sm text-[#587078]">Solo mostramos horarios que siguen libres.</p>
      <div className="-mx-5 mt-6 overflow-x-auto px-5 pb-2 sm:-mx-0 sm:px-0">
        <div className="flex min-w-max gap-2" role="list" aria-label="Próximos siete días">
          {dates.map((value, index) => {
            const apiDate = formatDateToAPI(value);
            const active = apiDate === date;
            return (
              <button type="button" key={apiDate} onClick={() => onDate(apiDate)} aria-pressed={active} className={`min-h-[68px] w-[72px] rounded-xl border-2 px-2 py-2 text-center transition ${active ? 'border-[var(--accent)] bg-[var(--accent)] text-white shadow-sm' : 'border-[#17313a]/10 bg-white text-[#17313a] hover:border-[var(--brand)]/35'}`}>
                <span className="block text-[11px] font-black uppercase">{dayLabel(value, index)}</span><span className="mt-1 block text-lg font-black leading-none">{value.getDate()}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-5 min-h-40 rounded-2xl border border-[#17313a]/10 bg-[#f7f4ed] p-4">
        <div className="flex items-center justify-between gap-3"><p className="flex items-center gap-2 text-sm font-black"><Clock3 className="h-4 w-4 text-[var(--brand)]" /> Horarios disponibles</p><button type="button" onClick={onRefresh} disabled={loading} className="grid h-10 w-10 place-items-center rounded-xl bg-white text-[var(--brand)] hover:bg-[#eaf4f5]" aria-label="Actualizar horarios"><RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /></button></div>
        {loading ? (
          <div className="grid grid-cols-3 gap-2 pt-5 sm:grid-cols-4">{Array.from({ length: 8 }, (_, index) => <div key={index} className="h-12 animate-pulse rounded-xl bg-[#17313a]/10" />)}</div>
        ) : availability?.slots.length ? (
          <div className="grid grid-cols-3 gap-2 pt-5 sm:grid-cols-4">
            {availability.slots.map((item) => {
              const active = selected?.start === item.start;
              return <button type="button" key={item.start} onClick={() => onSelect(item)} aria-pressed={active} className={`min-h-12 rounded-xl border-2 px-2 text-sm font-black transition ${active ? 'border-[var(--brand)] bg-[var(--brand)] text-white' : 'border-[#17313a]/10 bg-white text-[#17313a] hover:border-[var(--brand)]/35'}`}>{formatTime(item.start)}</button>;
            })}
          </div>
        ) : (
          <div className="py-9 text-center"><p className="font-black text-[#17313a]">No hay horas libres este día</p><p className="mt-1 text-sm text-[#587078]">Prueba otra fecha o vuelve y elige al primero disponible.</p></div>
        )}
      </div>
    </fieldset>
  );
}
