import { CalendarDays, Clock3, CreditCard, Scissors, User } from 'lucide-react';
import type { AvailabilitySlot, Barber, Service } from '../../types';
import { formatDateLong, formatPrice, formatTime } from '../../utils/helpers';

export function ReviewStep({ service, barber, barberIsAny, date, slot, customerName, paymentMethod }: {
  service: Service;
  barber: Barber | null;
  barberIsAny: boolean;
  date: string;
  slot: AvailabilitySlot;
  customerName: string;
  paymentMethod: 'CASH' | 'ONLINE';
}) {
  const price = service.priceType === 'confirm' ? 'Por confirmar' : `${service.priceType === 'estimate' ? 'Aprox. ' : service.priceType === 'starting_at' ? 'Desde ' : ''}${formatPrice(service.price)}`;
  const rows = [
    { icon: Scissors, label: 'Servicio', value: `${service.name} · ${price}` },
    { icon: User, label: 'Barbero', value: barberIsAny ? 'Primero disponible' : barber?.name || 'Por asignar' },
    { icon: CalendarDays, label: 'Fecha', value: formatDateLong(new Date(`${date}T12:00:00`)) },
    { icon: Clock3, label: 'Hora', value: `${formatTime(slot.start)}–${formatTime(slot.end)}` },
    { icon: CreditCard, label: 'Pago', value: paymentMethod === 'CASH' ? 'En el local' : 'En línea' },
  ];
  return <div><h2 className="booking-title">Confirmación</h2><p className="booking-description">Revisa los datos antes de crear la cita a nombre de {customerName}.</p><dl className="mt-6 divide-y divide-[var(--stone)] rounded-2xl border border-[var(--stone)] bg-[var(--surface-light)] px-5">{rows.map(({ icon: Icon, label, value }) => <div key={label} className="flex items-start gap-3 py-4"><Icon className="mt-0.5 h-5 w-5 shrink-0 text-[var(--primary)]" /><div><dt className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">{label}</dt><dd className="mt-1 font-semibold capitalize">{value}</dd></div></div>)}</dl>{paymentMethod === 'ONLINE' && <p className="mt-5 rounded-xl bg-[#FFF5EA] p-4 text-sm leading-6">Después de confirmar, irás al checkout. La cita quedará pendiente hasta que el proveedor confirme el pago.</p>}</div>;
}
