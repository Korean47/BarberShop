import { Check } from 'lucide-react';

const steps = ['Corte', 'Barbero', 'Horario', 'Tus datos'];

export function BookingProgress({ current }: { current: number }) {
  return (
    <nav aria-label="Progreso de la reserva" className="mx-auto mb-6 max-w-3xl sm:mb-8">
      <ol className="grid grid-cols-4 gap-1.5 sm:gap-3">
        {steps.map((label, index) => {
          const number = index + 1;
          const completed = current > number;
          const active = current === number;
          return (
            <li key={label} aria-current={active ? 'step' : undefined}>
              <div className={`mb-2 h-1.5 rounded-full ${current >= number ? 'bg-[var(--accent)]' : 'bg-[#17313a]/10'}`} />
              <div className="flex items-center gap-1.5">
                <span className={`grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-black ${active ? 'bg-[var(--brand)] text-white' : completed ? 'bg-[#f2c14e] text-[#17313a]' : 'bg-[#17313a]/8 text-[#587078]'}`}>{completed ? <Check className="h-4 w-4" aria-hidden="true" /> : number}</span>
                <span className={`hidden truncate text-xs font-bold min-[390px]:block ${active ? 'text-[#17313a]' : 'text-[#6b7e84]'}`}>{label}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
