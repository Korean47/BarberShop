import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock3, MapPin, Phone, Scissors } from 'lucide-react';
import toast from 'react-hot-toast';
import { useReducedMotion } from 'framer-motion';
import { HeroMedia } from '../components/home/HeroMedia';
import { getBarbers, getServices } from '../services/api';
import { useTenant } from '../hooks/useTenant';
import type { Barber, Service } from '../types';
import { formatDuration, formatPrice, parseSpecialties } from '../utils/helpers';

function servicePrice(service: Service) {
  const price = formatPrice(service.price);
  if (service.priceType === 'starting_at') return `Desde ${price}`;
  if (service.priceType === 'estimate') return `Aprox. ${price}`;
  if (service.priceType === 'confirm') return 'Por confirmar';
  return price;
}

function scheduleSummary(schedules: { dayOfWeek: number; startMinute: number; endMinute: number; isOpen: boolean }[]) {
  const open = schedules.filter((item) => item.isOpen);
  if (!open.length) return 'Consulta los horarios disponibles al reservar';
  const minute = (value: number) => `${Math.floor(value / 60)}:${String(value % 60).padStart(2, '0')}`;
  const weekdays = open.filter((item) => item.dayOfWeek >= 1 && item.dayOfWeek <= 5);
  const saturday = open.find((item) => item.dayOfWeek === 6);
  const parts: string[] = [];
  if (weekdays.length) parts.push(`Lun–Vie ${minute(weekdays[0].startMinute)}–${minute(weekdays[0].endMinute)}`);
  if (saturday) parts.push(`Sáb ${minute(saturday.startMinute)}–${minute(saturday.endMinute)}`);
  return parts.join(' · ') || 'Consulta los horarios disponibles al reservar';
}

export function Home() {
  const { tenant } = useTenant();
  const reducedMotion = useReducedMotion() ?? false;
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [activeBarber, setActiveBarber] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([getServices(), getBarbers()])
      .then(([serviceList, barberList]) => { setServices(serviceList); setBarbers(barberList); })
      .catch(() => toast.error('No pudimos actualizar los servicios y horarios'));
  }, []);

  const location = tenant.locations.find((item) => item.isDefault) ?? tenant.locations[0];
  const address = location ? [location.addressLine1, location.addressLine2, `${location.city}, ${location.state}`].filter(Boolean).join(', ') : 'Ubicación por confirmar';
  const mapsUrl = location?.mapsUrl || tenant.branding?.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  const currentBarber = barbers[activeBarber];
  const heroTitle = tenant.branding?.heroTitle || 'Cortes y barba, con tiempo para hacerlo bien.';
  const heroSubtitle = tenant.branding?.heroSubtitle || 'Elige servicio, barbero y horario. Tu cita queda lista en pocos pasos.';
  const availableServices = services.slice(0, 6);

  const moveBarber = (direction: number) => {
    if (!barbers.length) return;
    setActiveBarber((current) => (current + direction + barbers.length) % barbers.length);
  };

  return (
    <>
      <section className="relative isolate min-h-[calc(100svh-64px)] overflow-hidden bg-[var(--text)] text-white sm:min-h-[calc(100svh-68px)]">
        <HeroMedia
          videoUrl={tenant.branding?.heroVideoUrl}
          mobileVideoUrl={tenant.branding?.heroMobileVideoUrl}
          posterUrl={tenant.branding?.heroPosterUrl}
          imageUrl={tenant.branding?.heroImageUrl}
          fallbackUrls={tenant.branding?.heroFallbackUrls}
          reducedMotion={reducedMotion}
          alt="Interior de la barbería durante un servicio"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(12,20,23,.9)_0%,rgba(12,20,23,.68)_48%,rgba(12,20,23,.2)_100%)]" />
        <div className="section-container relative z-10 flex min-h-[calc(100svh-64px)] items-end pb-[max(3rem,env(safe-area-inset-bottom))] pt-20 sm:min-h-[calc(100svh-68px)] sm:items-center sm:py-20">
          <div className="max-w-2xl">
            <p className="flex items-center gap-2 text-sm font-semibold tracking-wide text-white/80"><Scissors className="h-4 w-4 text-[#D7D0C6]" /> {tenant.name}</p>
            <h1 className="type-display mt-5 max-w-[13ch] text-balance">{heroTitle}</h1>
            <p className="type-body-large mt-5 max-w-xl text-white/82">{heroSubtitle}</p>
            <div className="mt-8 flex flex-col gap-3 min-[390px]:flex-row">
              <Link to="/book" className="button-primary min-h-[52px] px-6">Agendar cita <ArrowRight className="h-5 w-5" /></Link>
              <Link to="/appointment" className="button-on-media min-h-[52px] px-6">Consultar mi cita</Link>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="scroll-mt-20 bg-[var(--surface-light)] py-16 sm:py-24">
        <div className="section-container">
          <div className="section-heading"><p className="eyebrow">Servicios</p><h2>Opciones y precios claros</h2><p>Selecciona un servicio para comenzar la reserva. La disponibilidad se calcula con la agenda de cada barbero.</p></div>
          <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {availableServices.map((service) => (
              <Link key={service.id} to={`/book?service=${service.id}`} className="service-card group">
                <img src={service.imageUrl || '/images/corte-clasico.webp'} alt={`Referencia de ${service.name}`} width="720" height="540" loading="lazy" />
                <span className="min-w-0 p-4">
                  <span className="flex items-start justify-between gap-3"><strong>{service.name}</strong><b>{servicePrice(service)}</b></span>
                  <span className="mt-3 flex items-center justify-between text-sm text-[var(--muted)]"><span className="flex items-center gap-1.5"><Clock3 className="h-4 w-4" /> {formatDuration(service.duration)}</span><ArrowRight className="h-4 w-4 text-[var(--accent)] transition-transform group-hover:translate-x-1" /></span>
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="barbers" className="scroll-mt-20 bg-[var(--background)] py-16 sm:py-24">
        <div className="section-container">
          <div className="section-heading"><p className="eyebrow">Barberos</p><h2>Elige quién te atiende</h2><p>Cada perfil indica los servicios que realiza. También puedes seleccionar al primero disponible durante la reserva.</p></div>
          {currentBarber && (
            <div
              className="mt-9 overflow-hidden rounded-[1.5rem] border border-[var(--stone)] bg-[var(--surface-light)] lg:grid lg:grid-cols-[1.08fr_.92fr]"
              onTouchStart={(event) => setTouchStart(event.touches[0].clientX)}
              onTouchEnd={(event) => {
                if (touchStart === null) return;
                const distance = event.changedTouches[0].clientX - touchStart;
                if (Math.abs(distance) > 45) moveBarber(distance > 0 ? -1 : 1);
                setTouchStart(null);
              }}
            >
              <img key={currentBarber.id} src={currentBarber.photo} alt={`Retrato de ${currentBarber.name}`} width="900" height="900" className="barber-photo-fade aspect-[4/3] h-full w-full object-cover lg:aspect-auto lg:min-h-[520px]" />
              <div className="flex min-w-0 flex-col justify-center p-6 sm:p-10 lg:p-14">
                <p className="eyebrow">Barbero {activeBarber + 1} de {barbers.length}</p>
                <h3 className="mt-3 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{currentBarber.name}</h3>
                <p className="mt-5 leading-7 text-[var(--muted)]">{currentBarber.bio}</p>
                <div className="mt-5 flex flex-wrap gap-2">{parseSpecialties(currentBarber.specialties).map((item) => <span key={item} className="tag">{item}</span>)}</div>
                <Link to={`/book?barber=${currentBarber.id}`} className="mt-7 inline-flex min-h-12 w-fit items-center gap-2 rounded-full border border-[var(--primary)] px-5 font-semibold text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white">Elegir a {currentBarber.name.split(' ')[0]} <ArrowRight className="h-4 w-4" /></Link>
                <div className="mt-8 flex items-center gap-2" aria-label="Cambiar barbero">
                  <button type="button" className="round-control" onClick={() => moveBarber(-1)} aria-label="Barbero anterior"><ArrowLeft className="h-5 w-5" /></button>
                  <div className="flex gap-2" aria-hidden="true">{barbers.map((barber, index) => <span key={barber.id} className={`h-1.5 rounded-full transition-all ${index === activeBarber ? 'w-8 bg-[var(--accent)]' : 'w-1.5 bg-[var(--stone)]'}`} />)}</div>
                  <button type="button" className="round-control" onClick={() => moveBarber(1)} aria-label="Barbero siguiente"><ArrowRight className="h-5 w-5" /></button>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <section id="location" className="scroll-mt-20 bg-[var(--surface-light)] py-16 sm:py-24">
        <div className="section-container grid gap-8 lg:grid-cols-[.95fr_1.05fr] lg:items-center">
          <div>
            <div className="section-heading"><p className="eyebrow">Ubicación</p><h2>Información para tu visita</h2></div>
            <dl className="mt-7 space-y-5">
              <div className="info-row"><MapPin /><div><dt>Dirección</dt><dd>{address}</dd></div></div>
              <div className="info-row"><Clock3 /><div><dt>Horarios</dt><dd>{scheduleSummary(location?.businessSchedules || [])}</dd></div></div>
              {(location?.phone || tenant.contactPhone) && <div className="info-row"><Phone /><div><dt>Contacto</dt><dd>{location?.phone || tenant.contactPhone}</dd></div></div>}
            </dl>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={mapsUrl} target="_blank" rel="noreferrer" className="button-secondary">Cómo llegar <ArrowRight className="h-4 w-4" /></a>
              {tenant.branding?.whatsappUrl && <a href={tenant.branding.whatsappUrl} target="_blank" rel="noreferrer" className="text-link">WhatsApp</a>}
            </div>
          </div>
          <a href={mapsUrl} target="_blank" rel="noreferrer" className="group relative min-h-[360px] overflow-hidden rounded-[1.5rem] bg-[var(--stone)] sm:min-h-[480px]" aria-label={`Abrir ubicación de ${tenant.name} en Google Maps`}>
            <img src={tenant.branding?.shopImageUrl || tenant.branding?.heroImageUrl || '/images/hero-local.webp'} alt={`Exterior o interior de ${tenant.name}`} width="1200" height="900" loading="lazy" className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]" />
            <span className="absolute inset-x-4 bottom-4 flex items-center justify-between rounded-2xl bg-[var(--surface-light)] p-4 font-semibold text-[var(--text)] shadow-lg sm:inset-x-6 sm:bottom-6"><span className="min-w-0 truncate">Abrir en Google Maps</span><MapPin className="h-5 w-5 shrink-0 text-[var(--accent)]" /></span>
          </a>
        </div>
      </section>
    </>
  );
}
