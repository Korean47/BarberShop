import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck2, Clock3, MapPin, Quote, ShieldCheck, Sparkles, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import { getBarbers, getServices } from '../services/api';
import { useTenant } from '../hooks/useTenant';
import type { Barber, Service } from '../types';
import { formatDuration, formatPrice, parseSpecialties } from '../utils/helpers';

export function Home() {
  const { tenant } = useTenant();
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);

  useEffect(() => {
    Promise.all([getServices(), getBarbers()])
      .then(([serviceList, barberList]) => {
        setServices(serviceList);
        setBarbers(barberList);
      })
      .catch(() => toast.error('No pudimos actualizar servicios y equipo'));
  }, []);

  const location = tenant.locations.find((item) => item.isDefault) ?? tenant.locations[0];

  return (
    <>
      <section className="overflow-hidden pb-16 pt-8 sm:pb-24 sm:pt-12">
        <div className="section-container grid items-center gap-10 lg:grid-cols-[.9fr_1.1fr] lg:gap-14">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#4e5953] shadow-sm">
              <span className="flex text-[var(--brand)]" aria-label="4.9 de 5 estrellas">{Array.from({ length: 5 }, (_, index) => <Star key={index} className="h-3 w-3 fill-current" />)}</span>
              4.9 por clientes locales
            </div>
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.24em] text-[var(--brand)]">Barbería premium en Hermosillo</p>
            <h1 className="text-balance mt-4 font-display text-[3.5rem] font-semibold leading-[.92] tracking-[-.03em] text-[#17211d] sm:text-7xl lg:text-[5.4rem]">
              Tu mejor corte,<br /><em className="font-medium text-[var(--brand)]">sin la espera.</em>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-7 text-[#59645e] sm:text-lg">Elige servicio, profesional y hora. Nosotros cuidamos el resto para que llegues directo a tu silla.</p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link to="/book" className="inline-flex min-h-13 items-center gap-2 rounded-full bg-[var(--brand-dark)] px-6 py-3.5 font-semibold text-white shadow-lg transition hover:-translate-y-0.5 hover:shadow-xl">
                Encontrar horario <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#services" className="inline-flex min-h-13 items-center rounded-full px-5 py-3.5 font-semibold text-[#17211d] hover:bg-white">Ver servicios</a>
            </div>
            <div className="mt-10 grid max-w-lg grid-cols-3 gap-3 border-t border-[#17211d]/10 pt-6">
              {[['Reserva 24/7', CalendarCheck2], ['Sin llamadas', Clock3], ['Datos protegidos', ShieldCheck]].map(([label, Icon]) => (
                <div key={label as string} className="flex items-center gap-2 text-xs font-semibold text-[#59645e] sm:text-sm"><Icon className="hidden h-4 w-4 text-[var(--brand)] sm:block" /> {label as string}</div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-8 -top-8 h-40 w-40 rounded-full bg-[var(--brand-soft)]/60 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2rem] bg-[var(--brand-dark)] shadow-2xl sm:rounded-[3rem]">
              <img
                src={tenant.branding?.heroImageUrl ?? '/images/barbershop-hero.webp'}
                alt="Barbero de Blades realizando un corte de precisión"
                width="1920"
                height="1080"
                fetchPriority="high"
                className="aspect-[4/5] w-full object-cover object-[66%_center] sm:aspect-[5/4] lg:aspect-[4/5]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#17211d]/60 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-2xl bg-[#f8f4ec]/95 p-4 text-[#17211d] shadow-xl backdrop-blur sm:bottom-7 sm:left-7 sm:right-auto sm:min-w-72">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[.18em] text-[var(--brand)]">Agenda en tiempo real</p>
                  <p className="mt-1 font-bold">Próximos espacios disponibles</p>
                </div>
                <Link to="/book" aria-label="Ver horarios" className="grid h-11 w-11 place-items-center rounded-full bg-[var(--brand-dark)] text-white"><ArrowRight className="h-4 w-4" /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="scroll-mt-24 bg-[#ece5da] py-20 sm:py-28">
        <div className="section-container">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--brand)]">Servicios</p>
              <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">El ritual que tu estilo pide</h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-[#657069]">Precios claros, tiempos reales y atención sin prisas. Cada servicio puede reservarse en línea.</p>
          </div>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => (
              <Link key={service.id} to={`/book?service=${service.id}`} className="group flex min-h-52 flex-col rounded-[1.5rem] bg-[#f8f4ec] p-6 transition hover:-translate-y-1 hover:shadow-xl">
                <div className="flex items-start justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-full bg-[var(--brand-dark)] text-sm font-bold text-[var(--brand-soft)]">{String(index + 1).padStart(2, '0')}</span>
                  <span className="font-display text-2xl font-semibold">{formatPrice(service.price)}</span>
                </div>
                <h3 className="mt-8 text-lg font-bold">{service.name}</h3>
                <p className="mt-2 flex-1 text-sm leading-6 text-[#657069]">{service.description}</p>
                <div className="mt-5 flex items-center justify-between border-t border-[#17211d]/10 pt-4 text-xs font-semibold text-[#657069]">
                  <span>{formatDuration(service.duration)}</span>
                  <span className="flex items-center gap-1 text-[#17211d]">Reservar <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" /></span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="section-container">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--brand)]">El equipo</p>
            <h2 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Manos expertas. Estilo propio.</h2>
            <p className="mt-4 text-sm leading-6 text-[#657069]">Elige a tu barbero favorito o déjanos asignarte al primero disponible.</p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {barbers.map((barber) => (
              <article key={barber.id} className="group">
                <Link to={`/barbers/${barber.id}`} className="block overflow-hidden rounded-[1.5rem] bg-[#ded4c6]">
                  <img src={barber.photo} alt={`Retrato de ${barber.name}`} loading="lazy" width="480" height="600" className="aspect-[4/5] w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
                </Link>
                <div className="px-1 pt-4">
                  <div className="flex items-center justify-between gap-3"><h3 className="text-lg font-bold">{barber.name}</h3><Link to={`/book?barber=${barber.id}`} className="grid h-9 w-9 place-items-center rounded-full border border-[#17211d]/15 hover:bg-white" aria-label={`Reservar con ${barber.name}`}><ArrowRight className="h-4 w-4" /></Link></div>
                  <p className="mt-1 text-sm text-[#657069]">{parseSpecialties(barber.specialties).slice(0, 2).join(' · ')}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-container pb-20 sm:pb-28">
        <div className="grid overflow-hidden rounded-[2rem] bg-[var(--brand-dark)] text-white lg:grid-cols-[.9fr_1.1fr]">
          <div className="p-7 sm:p-12 lg:p-16">
            <Sparkles className="h-7 w-7 text-[var(--brand-soft)]" />
            <h2 className="mt-6 font-display text-4xl font-semibold leading-tight sm:text-5xl">Una buena experiencia empieza antes de sentarte.</h2>
            <p className="mt-5 max-w-lg text-base leading-7 text-white/65">Confirmaciones claras, horarios actualizados y el servicio que elegiste listo a tu llegada.</p>
            <div className="mt-8 space-y-4">
              {['Reserva sin crear una cuenta', 'El precio se calcula en el servidor', 'Administra tu cita con un enlace privado'].map((text) => <p key={text} className="flex items-center gap-3 text-sm font-semibold"><span className="grid h-6 w-6 place-items-center rounded-full bg-white/10 text-[var(--brand-soft)]">✓</span>{text}</p>)}
            </div>
          </div>
          <div className="grid place-items-center bg-[#223129] p-7 sm:p-12">
            <blockquote className="max-w-lg">
              <Quote className="h-10 w-10 text-[var(--brand-soft)]" />
              <p className="mt-6 font-display text-3xl font-medium leading-snug sm:text-4xl">“Reservé camino al trabajo y llegué directo a mi cita. El corte quedó exactamente como quería.”</p>
              <footer className="mt-7 text-sm font-semibold text-white/60">Carlos M. · Cliente verificado</footer>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="border-t border-[#17211d]/10 py-20 text-center sm:py-24">
        <div className="section-container">
          <MapPin className="mx-auto h-7 w-7 text-[var(--brand)]" />
          <h2 className="mt-4 font-display text-4xl font-semibold sm:text-5xl">Tu silla está lista.</h2>
          <p className="mt-3 text-[#657069]">{location ? `${location.addressLine1}, ${location.city}` : 'Hermosillo, Sonora'}</p>
          <Link to="/book" className="mt-7 inline-flex items-center gap-2 rounded-full bg-[var(--brand-dark)] px-7 py-4 font-semibold text-white shadow-lg hover:shadow-xl">Reservar ahora <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </>
  );
}
