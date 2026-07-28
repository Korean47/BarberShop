import { Check, Users } from 'lucide-react';
import type { Barber } from '../../types';
import { parseSpecialties } from '../../utils/helpers';

export type BarberChoice = string | 'any' | null;

export function BarberStep({ barbers, selected, onSelect }: { barbers: Barber[]; selected: BarberChoice; onSelect(value: BarberChoice): void }) {
  return (
    <fieldset>
      <legend className="booking-title">Barbero</legend>
      <p className="booking-description">Selecciona una persona o consulta la disponibilidad de todo el equipo.</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <button type="button" aria-pressed={selected === 'any'} onClick={() => onSelect('any')} className={`booking-option flex min-h-24 items-center gap-3 p-3.5 text-left ${selected === 'any' ? 'booking-option-active' : ''}`}><span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-[var(--primary)] text-white"><Users className="h-7 w-7" /></span><span className="min-w-0"><strong className="block">Primero disponible</strong><span className="mt-1 block text-xs leading-5 text-[var(--muted)]">Muestra más opciones de horario.</span></span>{selected === 'any' && <Check className="ml-auto h-5 w-5 shrink-0 text-[var(--accent)]" />}</button>
        {barbers.map((barber) => <button type="button" key={barber.id} aria-pressed={selected === barber.id} onClick={() => onSelect(barber.id)} className={`booking-option flex min-h-24 items-center gap-3 p-3.5 text-left ${selected === barber.id ? 'booking-option-active' : ''}`}><img src={barber.photo} alt={`Retrato de ${barber.name}`} className="h-16 w-16 shrink-0 rounded-xl object-cover" width="64" height="64" loading="lazy" /><span className="min-w-0"><strong className="block truncate">{barber.name}</strong><span className="mt-1 block line-clamp-2 text-xs leading-5 text-[var(--muted)]">{parseSpecialties(barber.specialties).slice(0, 2).join(' · ')}</span></span>{selected === barber.id && <Check className="ml-auto h-5 w-5 shrink-0 text-[var(--accent)]" />}</button>)}
      </div>
    </fieldset>
  );
}
