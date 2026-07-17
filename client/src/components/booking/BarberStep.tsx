import { Check, Users } from 'lucide-react';
import type { Barber } from '../../types';
import { parseSpecialties } from '../../utils/helpers';

export type BarberChoice = string | 'any' | null;

export function BarberStep({ barbers, selected, onSelect }: { barbers: Barber[]; selected: BarberChoice; onSelect(value: BarberChoice): void }) {
  return (
    <fieldset>
      <legend className="text-2xl font-black tracking-tight text-[#17313a] sm:text-3xl">¿Quién te atiende?</legend>
      <p className="mt-2 text-sm text-[#587078]">Con “el primero disponible” normalmente encuentras más horas.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <button type="button" aria-pressed={selected === 'any'} onClick={() => onSelect('any')} className={`relative flex min-h-24 items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition ${selected === 'any' ? 'border-[var(--accent)] bg-[#fff8ee] shadow-md' : 'border-[#17313a]/10 bg-white hover:border-[var(--brand)]/35'}`}>
          <span className="grid h-16 w-16 shrink-0 place-items-center rounded-xl bg-[var(--brand)] text-white"><Users className="h-7 w-7" /></span>
          <span className="pr-5"><span className="block font-black text-[#17313a]">El primero disponible</span><span className="mt-1 block text-xs leading-4 text-[#587078]">La forma más rápida de apartar.</span></span>
          {selected === 'any' && <Check className="absolute right-3 top-3 h-5 w-5 text-[var(--accent)]" />}
        </button>
        {barbers.map((barber) => {
          const isSelected = selected === barber.id;
          return (
            <button type="button" key={barber.id} aria-pressed={isSelected} onClick={() => onSelect(barber.id)} className={`relative flex min-h-24 items-center gap-3 rounded-2xl border-2 p-3.5 text-left transition ${isSelected ? 'border-[var(--accent)] bg-[#fff8ee] shadow-md' : 'border-[#17313a]/10 bg-white hover:border-[var(--brand)]/35'}`}>
              <img src={barber.photo} alt="" className="h-16 w-16 shrink-0 rounded-xl object-cover" width="64" height="64" loading="lazy" />
              <span className="min-w-0 pr-5"><span className="block truncate font-black text-[#17313a]">{barber.name}</span><span className="mt-1 block line-clamp-2 text-xs leading-4 text-[#587078]">{parseSpecialties(barber.specialties).slice(0, 2).join(' · ')}</span></span>
              {isSelected && <Check className="absolute right-3 top-3 h-5 w-5 text-[var(--accent)]" />}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
