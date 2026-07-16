import { Check } from 'lucide-react';

const steps = ['Servicio', 'Profesional', 'Horario', 'Confirmación'];

export function BookingProgress({ current }: { current: number }) {
  return (
    <nav aria-label="Progreso de la reserva" className="mx-auto mb-8 max-w-3xl">
      <ol className="grid grid-cols-4 gap-1">
        {steps.map((label, index) => {
          const number = index + 1;
          const completed = current > number;
          const active = current === number;
          return (
            <li key={label} aria-current={active ? 'step' : undefined}>
              <div className={`mb-2 h-1 rounded-full ${current >= number ? 'bg-[var(--brand)]' : 'bg-[#17211d]/10'}`} />
              <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-2">
                <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-xs font-bold ${active ? 'bg-[var(--brand-dark)] text-white' : completed ? 'bg-[var(--brand-soft)] text-[#17211d]' : 'bg-[#17211d]/8 text-[#657069]'}`}>
                  {completed ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : number}
                </span>
                <span className={`block max-w-full truncate text-[9px] font-semibold sm:text-xs ${active ? 'text-[#17211d]' : 'text-[#7a827e]'}`}>{label}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
