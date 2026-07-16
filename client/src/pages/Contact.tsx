import { Clock3, Mail, MapPin, Phone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTenant } from '../hooks/useTenant';

export function Contact() {
  const { tenant } = useTenant();
  const location = tenant.locations.find((item) => item.isDefault) ?? tenant.locations[0];
  const address = location ? `${location.addressLine1}, ${location.city}, ${location.state}` : 'Hermosillo, Sonora';
  return (
    <div className="section-container py-14 sm:py-20">
      <div className="mx-auto max-w-5xl">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--brand)]">Visítanos</p>
          <h1 className="mt-3 font-display text-5xl font-semibold sm:text-6xl">Tu próxima parada para verte mejor.</h1>
          <p className="mt-5 text-base leading-7 text-[#657069]">Reserva en línea para asegurar tu horario o contáctanos si necesitas un servicio especial.</p>
        </div>
        <div className="mt-10 grid overflow-hidden rounded-[2rem] bg-white shadow-xl lg:grid-cols-[1.1fr_.9fr]">
          <div className="min-h-80 bg-[var(--brand-dark)] p-7 text-white sm:p-10">
            <MapPin className="h-8 w-8 text-[var(--brand-soft)]" />
            <h2 className="mt-6 font-display text-3xl font-semibold">{location?.name ?? tenant.name}</h2>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">{address}</p>
            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer" className="mt-7 inline-flex rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#17211d]">Abrir en mapas</a>
          </div>
          <div className="grid gap-6 p-7 sm:p-10">
            <ContactRow icon={Phone} label="Teléfono" value={location?.phone ?? tenant.contactPhone ?? 'Atención por cita'} href={tenant.contactPhone ? `tel:${tenant.contactPhone}` : undefined} />
            <ContactRow icon={Mail} label="Correo" value={tenant.contactEmail ?? 'Disponible próximamente'} href={tenant.contactEmail ? `mailto:${tenant.contactEmail}` : undefined} />
            <ContactRow icon={Clock3} label="Horario" value="Lunes a sábado · Consulta disponibilidad en línea" />
            <Link to="/book" className="mt-2 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--brand-dark)] px-6 font-semibold text-white">Reservar una cita</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactRow({ icon: Icon, label, value, href }: { icon: typeof Phone; label: string; value: string; href?: string }) {
  const content = <><span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[#17211d]/5 text-[var(--brand)]"><Icon className="h-5 w-5" /></span><span><span className="block text-xs font-bold uppercase tracking-wider text-[#8a918d]">{label}</span><span className="mt-1 block text-sm font-semibold text-[#17211d]">{value}</span></span></>;
  return href ? <a href={href} className="flex items-center gap-4 rounded-xl hover:bg-[#17211d]/[.02]">{content}</a> : <div className="flex items-center gap-4">{content}</div>;
}
