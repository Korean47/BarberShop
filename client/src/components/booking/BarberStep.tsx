import { Check, Sparkles, Users } from 'lucide-react';
import type { Barber } from '../../types';
import { parseSpecialties } from '../../utils/helpers';

export type BarberChoice = string | 'any' | null;

export function BarberStep({ barbers, selected, onSelect }: {
  barbers: Barber[];
  selected: BarberChoice;
  onSelect(value: BarberChoice): void;
}) {
  return (
    <fieldset>
      <legend className="font-display text-3xl font-semibold text-[#17211d]">Elige quién te atiende</legend>
      <p className="mt-2 text-sm text-[#657069]">Si eliges “cualquiera”, te mostraremos más horarios.</p>
      <div className="mt-7 grid gap-3 sm:grid-cols-2">
        <button
          type="button"
          aria-pressed={selected === 'any'}
          onClick={() => onSelect('any')}
          className={`relative flex min-h-32 items-center gap-4 rounded-2xl border p-5 text-left transition ${selected === 'any' ? 'border-[var(--brand)] bg-[#fffaf1] shadow-lg' : 'border-[#17211d]/10 bg-white hover:border-[#17211d]/25'}`}
        >
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[var(--brand-dark)] text-[var(--brand-soft)]"><Users className="h-7 w-7" /></span>
          <span>
            <span className="flex items-center gap-2 font-bold text-[#17211d]">Cualquier barbero <Sparkles className="h-4 w-4 text-[var(--brand)]" /></span>
            <span className="mt-1 block text-sm leading-5 text-[#657069]">La opción más rápida: asignamos al primer profesional disponible.</span>
          </span>
          {selected === 'any' && <Check className="absolute right-4 top-4 h-5 w-5 text-[var(--brand)]" />}
        </button>
        {barbers.map((barber) => {
          const selectedBarber = selected === barber.id;
          return (
            <button
              type="button"
              key={barber.id}
              aria-pressed={selectedBarber}
              onClick={() => onSelect(barber.id)}
              className={`relative flex min-h-32 items-center gap-4 rounded-2xl border p-5 text-left transition ${selectedBarber ? 'border-[var(--brand)] bg-[#fffaf1] shadow-lg' : 'border-[#17211d]/10 bg-white hover:border-[#17211d]/25'}`}
            >
              <img src={barber.photo} alt="" className="h-16 w-16 shrink-0 rounded-2xl object-cover" width="64" height="64" loading="lazy" />
              <span>
                <span className="font-bold text-[#17211d]">{barber.name}</span>
                <span className="mt-1 block text-sm text-[#657069]">{parseSpecialties(barber.specialties).slice(0, 2).join(' · ')}</span>
              </span>
              {selectedBarber && <Check className="absolute right-4 top-4 h-5 w-5 text-[var(--brand)]" />}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
