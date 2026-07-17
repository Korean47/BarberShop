import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarCheck2, Check, Clock3, MapPin, Phone, Scissors, Star } from 'lucide-react';
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
      .then(([serviceList, barberList]) => { setServices(serviceList); setBarbers(barberList); })
      .catch(() => toast.error('No pudimos actualizar los cortes y horarios'));
  }, []);

  const location = tenant.locations.find((item) => item.isDefault) ?? tenant.locations[0];
  const address = location ? `${location.addressLine1}, ${location.city}` : 'Hermosillo, Sonora';
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <>
      <section className="overflow-hidden bg-[#fffaf0] pb-12 pt-6 sm:pb-16 sm:pt-10 lg:pb-20">
        <div className="section-container grid items-center gap-8 lg:grid-cols-[.86fr_1.14fr] lg:gap-12">
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-lg bg-[#f2c14e]/25 px-3 py-2 text-xs font-black text-[#17313a]">
              <Star className="h-4 w-4 fill-[#e4572e] text-[#e4572e]" /> Barbería local en Hermosillo
            </div>
            <h1 className="text-balance mt-5 text-[2.65rem] font-black leading-[1.02] tracking-[-.04em] text-[#17313a] min-[390px]:text-5xl sm:text-6xl lg:text-[4.6rem]">
              El corte que quieres, <span className="text-[var(--accent)]">a precio justo.</span>
            </h1>
            <p className="mt-5 max-w-xl text-base font-medium leading-7 text-[#526b73] sm:text-lg">Mira los precios, elige a tu barbero y aparta tu hora. Sin llamadas, sin vueltas.</p>
            <div className="mt-7 flex flex-col gap-3 min-[390px]:flex-row">
              <Link to="/book" className="inline-flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 font-black text-white shadow-md transition hover:-translate-y-0.5 hover:bg-[#c94725]">
                Agendar cita <ArrowRight className="h-5 w-5" />
              </Link>
              <a href="#services" className="inline-flex min-h-[52px] items-center justify-center rounded-xl border-2 border-[#17313a]/15 bg-white px-6 font-bold text-[#17313a] hover:border-[var(--brand)]">Ver cortes y precios</a>
            </div>
            <div className="mt-7 grid max-w-xl gap-2 text-sm font-semibold text-[#526b73] min-[390px]:grid-cols-2">
              <span className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[var(--brand)]" /> Lun–Vie 8:00–20:00</span>
              <span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-[var(--brand)]" /> {address}</span>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -right-12 -top-10 h-52 w-52 rounded-full bg-[#f2c14e]/35 blur-3xl" />
            <div className="relative overflow-hidden rounded-2xl border-4 border-white bg-white shadow-xl sm:rounded-3xl">
              <img src={tenant.branding?.heroImageUrl ?? '/images/hero-local.webp'} alt="Barbero joven atendiendo a un cliente en una barbería local" width="1600" height="900" fetchPriority="high" className="aspect-[16/11] w-full object-cover object-center sm:aspect-[16/10] lg:aspect-[4/3]" />
              <div className="absolute inset-x-3 bottom-3 flex items-center justify-between gap-3 rounded-xl bg-white/95 p-3 shadow-lg backdrop-blur sm:inset-x-5 sm:bottom-5 sm:p-4">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-xs font-black text-[var(--brand)]"><CalendarCheck2 className="h-4 w-4" /> Reserva en línea</p>
                  <p className="mt-0.5 truncate text-sm font-bold sm:text-base">Ve los horarios disponibles</p>
                </div>
                <Link to="/book" aria-label="Agendar una cita" className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[var(--brand)] text-white"><ArrowRight className="h-5 w-5" /></Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="scroll-mt-20 bg-white py-14 sm:py-20">
        <div className="section-container">
          <div className="max-w-2xl">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--accent)]">Cortes y precios</p>
            <h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Elige lo que te queda bien</h2>
            <p className="mt-3 text-base leading-7 text-[#587078]">Sin paquetes raros ni precios escondidos. Lo que ves es lo que pagas.</p>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <Link key={service.id} to={`/book?service=${service.id}`} className="group grid min-h-32 grid-cols-[112px_1fr] overflow-hidden rounded-2xl border border-[#17313a]/10 bg-[#fffaf0] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--brand)]/30 hover:shadow-md sm:grid-cols-[136px_1fr]">
                <img src={service.imageUrl ?? '/images/corte-clasico.webp'} alt={service.name} width="720" height="540" loading="lazy" className="h-full min-h-32 w-full object-cover" />
                <div className="flex min-w-0 flex-col p-4">
                  <div className="flex items-start justify-between gap-2"><h3 className="font-black leading-tight">{service.name}</h3><span className="shrink-0 text-base font-black text-[var(--accent)]">{formatPrice(service.price)}</span></div>
                  <p className="mt-2 line-clamp-2 flex-1 text-sm leading-5 text-[#587078]">{service.description}</p>
                  <div className="mt-3 flex items-center justify-between text-xs font-bold text-[#587078]"><span>{formatDuration(service.duration)}</span><span className="flex items-center gap-1 text-[var(--brand)]">Elegir <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-1" /></span></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="team" className="scroll-mt-20 bg-[#eaf4f5] py-14 sm:py-20">
        <div className="section-container">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div><p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--brand)]">La banda</p><h2 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Barberos que sí te escuchan</h2></div>
            <p className="max-w-md text-sm leading-6 text-[#587078]">Elige a quien ya conoces o marca “cualquiera” para encontrar hora más rápido.</p>
          </div>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {barbers.map((barber) => (
              <article key={barber.id} className="overflow-hidden rounded-2xl border border-[#17313a]/10 bg-white shadow-sm">
                <Link to={`/barbers/${barber.id}`} className="block"><img src={barber.photo} alt={`Retrato de ${barber.name}`} loading="lazy" width="640" height="640" className="aspect-square w-full object-cover transition duration-300 hover:scale-[1.02]" /></Link>
                <div className="p-3 sm:p-4"><h3 className="font-black leading-tight">{barber.name}</h3><p className="mt-1 line-clamp-1 text-xs text-[#587078] sm:text-sm">{parseSpecialties(barber.specialties).slice(0, 2).join(' · ')}</p><Link to={`/book?barber=${barber.id}`} className="mt-3 inline-flex min-h-10 w-full items-center justify-center rounded-xl bg-[#eaf4f5] px-3 text-xs font-black text-[var(--brand)] hover:bg-[#d5ecef]">Agendar con {barber.name.split(' ')[0]}</Link></div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--brand)] py-14 text-white sm:py-18">
        <div className="section-container grid gap-8 lg:grid-cols-[1fr_.9fr] lg:items-center">
          <div><Scissors className="h-8 w-8 text-[var(--brand-soft)]" /><h2 className="mt-4 max-w-2xl text-3xl font-black tracking-tight sm:text-4xl">Una cita clara de principio a fin</h2><div className="mt-5 grid gap-3 sm:grid-cols-3">{['Sin crear cuenta', 'Precio confirmado', 'Cambia o cancela fácil'].map((text) => <p key={text} className="flex items-center gap-2 text-sm font-bold"><span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/15"><Check className="h-4 w-4 text-[var(--brand-soft)]" /></span>{text}</p>)}</div></div>
          <div className="rounded-2xl bg-white p-5 text-[#17313a] sm:p-6"><p className="text-sm font-black uppercase tracking-[0.14em] text-[var(--accent)]">¿Listo para un cambio?</p><p className="mt-2 text-xl font-black">Aparta tu silla en menos de dos minutos.</p><Link to="/book" className="mt-5 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-5 font-black text-white">Agendar cita <ArrowRight className="h-5 w-5" /></Link></div>
        </div>
      </section>

      <section className="py-14 sm:py-18">
        <div className="section-container grid gap-6 rounded-2xl border border-[#17313a]/10 bg-white p-5 sm:grid-cols-[1fr_auto] sm:items-center sm:p-8">
          <div><div className="flex items-center gap-2 text-[var(--accent)]"><MapPin className="h-6 w-6" /><span className="text-xs font-black uppercase tracking-[0.16em]">Encuéntranos</span></div><h2 className="mt-3 text-2xl font-black sm:text-3xl">Estamos cerca. Pasa cuando te toque.</h2><p className="mt-2 text-[#587078]">{address} · {tenant.contactPhone ?? 'Atención por cita'}</p></div>
          <div className="flex flex-col gap-2 min-[390px]:flex-row"><a href={mapsUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-[#17313a]/15 px-5 font-bold"><MapPin className="h-4 w-4" /> Abrir mapa</a>{tenant.contactPhone && <a href={`tel:${tenant.contactPhone}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--brand)] px-5 font-bold text-white"><Phone className="h-4 w-4" /> Llamar</a>}</div>
        </div>
      </section>
    </>
  );
}
