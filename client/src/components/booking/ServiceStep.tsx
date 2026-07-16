import { Check, Clock3 } from 'lucide-react';
import type { Service } from '../../types';
import { formatDuration, formatPrice } from '../../utils/helpers';

export function ServiceStep({ services, selectedId, onSelect }: {
  services: Service[];
  selectedId: string | null;
  onSelect(id: string): void;
}) {
  const categories = [...new Set(services.map((service) => service.category))];
  return (
    <fieldset>
      <legend className="font-display text-3xl font-semibold text-[#17211d]">¿Qué te hacemos hoy?</legend>
      <p className="mt-2 text-sm text-[#657069]">El precio y el tiempo se confirman antes de reservar.</p>
      <div className="mt-7 space-y-8">
        {categories.map((category) => (
          <section key={category} aria-labelledby={`category-${category}`}>
            <h2 id={`category-${category}`} className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand)]">{category}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {services.filter((service) => service.category === category).map((service) => {
                const selected = service.id === selectedId;
                return (
                  <button
                    type="button"
                    key={service.id}
                    aria-pressed={selected}
                    onClick={() => onSelect(service.id)}
                    className={`group min-h-36 rounded-2xl border p-5 text-left transition focus-visible:ring-2 focus-visible:ring-[var(--brand)] ${selected ? 'border-[var(--brand)] bg-[#fffaf1] shadow-lg' : 'border-[#17211d]/10 bg-white hover:-translate-y-0.5 hover:border-[#17211d]/25 hover:shadow-md'}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-base font-bold text-[#17211d]">{service.name}</h3>
                        <p className="mt-2 line-clamp-2 text-sm leading-5 text-[#657069]">{service.description}</p>
                      </div>
                      <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${selected ? 'border-[var(--brand)] bg-[var(--brand)] text-white' : 'border-[#17211d]/20 text-transparent'}`}>
                        <Check className="h-3.5 w-3.5" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-[#17211d]/8 pt-3">
                      <span className="flex items-center gap-1.5 text-xs font-medium text-[#657069]"><Clock3 className="h-3.5 w-3.5" /> {formatDuration(service.duration)}</span>
                      <span className="font-bold text-[#17211d]">{formatPrice(service.price)}</span>
                    </div>
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
