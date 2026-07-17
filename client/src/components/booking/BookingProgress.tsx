import { Check } from 'lucide-react';

const steps = ['Servicio', 'Barbero', 'Fecha', 'Datos', 'Pago', 'Confirmar'];

export function BookingProgress({ current }: { current: number }) {
  return (
    <nav aria-label="Progreso de la reservación" className="booking-progress">
      <ol className="grid grid-cols-6 gap-1 sm:gap-2">
        {steps.map((label, index) => {
          const number = index + 1;
          const completed = current > number;
          const active = current === number;
          return <li key={label} aria-current={active ? 'step' : undefined} className="min-w-0"><div className={`h-1 rounded-full ${current >= number ? 'bg-[var(--accent)]' : 'bg-[var(--stone)]'}`} /><div className="mt-2 flex items-center gap-1.5"><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full text-[11px] font-semibold ${active ? 'bg-[var(--primary)] text-white' : completed ? 'bg-[var(--success)] text-white' : 'bg-[var(--stone)] text-[var(--muted)]'}`}>{completed ? <Check className="h-3.5 w-3.5" /> : number}</span><span className={`hidden truncate text-xs lg:block ${active ? 'font-semibold text-[var(--text)]' : 'text-[var(--muted)]'}`}>{label}</span></div></li>;
        })}
      </ol>
    </nav>
  );
}
