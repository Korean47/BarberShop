import { Check, Clock3 } from 'lucide-react';
import type { Service } from '../../types';
import { formatDuration, formatPrice } from '../../utils/helpers';

export function ServiceStep({ services, selectedId, onSelect }: { services: Service[]; selectedId: string | null; onSelect(id: string): void }) {
  const categories = [...new Set(services.map((service) => service.category))];
  return (
    <fieldset>
      <legend className="text-2xl font-black tracking-tight text-[#17313a] sm:text-3xl">¿Qué corte quieres?</legend>
      <p className="mt-2 text-sm text-[#587078]">Toca una opción para ver barberos y horarios.</p>
      <div className="mt-6 space-y-7">
        {categories.map((category) => (
          <section key={category} aria-labelledby={`category-${category}`}>
            <h2 id={`category-${category}`} className="mb-3 text-xs font-black uppercase tracking-[0.16em] text-[var(--accent)]">{category}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {services.filter((service) => service.category === category).map((service) => {
                const selected = service.id === selectedId;
                return (
                  <button type="button" key={service.id} aria-pressed={selected} onClick={() => onSelect(service.id)} className={`group grid min-h-[116px] grid-cols-[92px_1fr] overflow-hidden rounded-2xl border-2 text-left transition sm:grid-cols-[104px_1fr] ${selected ? 'border-[var(--accent)] bg-[#fff8ee] shadow-md' : 'border-[#17313a]/10 bg-white hover:border-[var(--brand)]/35'}`}>
                    <img src={service.imageUrl ?? '/images/corte-clasico.webp'} alt="" width="720" height="540" loading="lazy" className="h-full min-h-[116px] w-full object-cover" />
                    <span className="flex min-w-0 flex-col p-3.5">
                      <span className="flex items-start justify-between gap-2"><span className="font-black leading-tight text-[#17313a]">{service.name}</span><span className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg border ${selected ? 'border-[var(--accent)] bg-[var(--accent)] text-white' : 'border-[#17313a]/20 text-transparent'}`}><Check className="h-4 w-4" /></span></span>
                      <span className="mt-1 line-clamp-2 text-xs leading-4 text-[#587078]">{service.description}</span>
                      <span className="mt-auto flex items-end justify-between gap-2 pt-2"><span className="flex items-center gap-1 text-xs font-semibold text-[#587078]"><Clock3 className="h-3.5 w-3.5" /> {formatDuration(service.duration)}</span><span className="font-black text-[var(--accent)]">{formatPrice(service.price)}</span></span>
                    </span>
                  </button>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </fieldset>
  );
}
