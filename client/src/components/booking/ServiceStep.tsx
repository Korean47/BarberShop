import { Check, Clock3 } from 'lucide-react';
import type { Service } from '../../types';
import { formatDuration, formatPrice } from '../../utils/helpers';

function priceLabel(service: Service) {
  if (service.priceType === 'confirm') return 'Por confirmar';
  const price = formatPrice(service.price);
  if (service.priceType === 'starting_at') return `Desde ${price}`;
  if (service.priceType === 'estimate') return `Aprox. ${price}`;
  return price;
}

export function ServiceStep({ services, selectedId, onSelect }: { services: Service[]; selectedId: string | null; onSelect(id: string): void }) {
  const categories = [...new Set(services.map((service) => service.category))];
  return (
    <fieldset>
      <legend className="booking-title">Servicio</legend>
      <p className="booking-description">Los precios y duraciones corresponden a la información publicada por la barbería.</p>
      <div className="mt-5 space-y-6">
        {categories.map((category) => <section key={category} aria-labelledby={`category-${category}`}><h2 id={`category-${category}`} className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">{category}</h2><div className="grid gap-3 sm:grid-cols-2">{services.filter((service) => service.category === category).map((service) => {
          const selected = service.id === selectedId;
          return <button type="button" key={service.id} aria-pressed={selected} onClick={() => onSelect(service.id)} className={`booking-option grid min-h-[104px] grid-cols-[84px_1fr] overflow-hidden p-0 text-left sm:grid-cols-[96px_1fr] ${selected ? 'booking-option-active' : ''}`}><img src={service.imageUrl || '/images/corte-clasico.webp'} alt={`Referencia de ${service.name}`} width="320" height="240" loading="lazy" className="h-full min-h-[104px] w-full object-cover" /><span className="flex min-w-0 flex-col p-3"><span className="flex items-start justify-between gap-2"><strong className="leading-tight">{service.name}</strong><span className={`selection-mark ${selected ? 'selection-mark-active' : ''}`}><Check className="h-3.5 w-3.5" /></span></span><span className="mt-auto flex items-end justify-between gap-2 pt-3"><span className="flex items-center gap-1 text-xs text-[var(--muted)]"><Clock3 className="h-3.5 w-3.5" /> {formatDuration(service.duration)}</span><b className="text-sm text-[var(--accent)]">{priceLabel(service)}</b></span></span></button>;
        })}</div></section>)}
      </div>
    </fieldset>
  );
}
