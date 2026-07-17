import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CalendarCheck2, CalendarPlus, CheckCircle2, MapPin, Scissors } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BookingProgress } from '../components/booking/BookingProgress';
import { ServiceStep } from '../components/booking/ServiceStep';
import { BarberStep, type BarberChoice } from '../components/booking/BarberStep';
import { TimeStep } from '../components/booking/TimeStep';
import { DetailsStep, type CustomerForm } from '../components/booking/DetailsStep';
import { Button } from '../components/ui/Button';
import { PageSpinner } from '../components/ui/Spinner';
import { useTenant } from '../hooks/useTenant';
import { ApiError, createAppointment, getAvailability, getBarbers, getServices, uploadReferenceImage } from '../services/api';
import type { AvailabilityResponse, AvailabilitySlot, Barber, CreateBookingResponse, Service } from '../types';
import { formatDateLong, formatDateToAPI, formatPrice, formatTime } from '../utils/helpers';
import { prepareReferenceImage } from '../utils/image';

const emptyCustomer: CustomerForm = { name: '', phone: '', email: '', notes: '', consent: false };

function calendarStamp(value: Date) { return value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, ''); }

export function BookAppointment() {
  const [searchParams] = useSearchParams();
  const initialServiceId = searchParams.get('service');
  const initialBarberId = searchParams.get('barber');
  const { tenant } = useTenant();
  const reducedMotion = useReducedMotion();
  const [step, setStep] = useState(1);
  const [services, setServices] = useState<Service[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);
  const [serviceId, setServiceId] = useState<string | null>(initialServiceId);
  const [barberChoice, setBarberChoice] = useState<BarberChoice>(initialBarberId);
  const [date, setDate] = useState(formatDateToAPI(new Date()));
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [slot, setSlot] = useState<AvailabilitySlot | null>(null);
  const [customer, setCustomer] = useState<CustomerForm>(emptyCustomer);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'ONLINE'>('CASH');
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CreateBookingResponse | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([getServices(), getBarbers()])
      .then(([serviceList, barberList]) => {
        if (!active) return;
        setServices(serviceList);
        setBarbers(barberList);
        if (initialServiceId && !serviceList.some((item) => item.id === initialServiceId)) setServiceId(null);
        if (initialBarberId && !barberList.some((item) => item.id === initialBarberId)) setBarberChoice(null);
      })
      .catch(() => toast.error('No pudimos cargar los cortes y horarios'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [initialBarberId, initialServiceId]);

  const refreshAvailability = useCallback((targetDate = date) => {
    if (!serviceId || !barberChoice) return;
    setAvailabilityLoading(true);
    setSlot(null);
    getAvailability({
      date: targetDate,
      serviceIds: [serviceId],
      barberId: barberChoice === 'any' ? undefined : barberChoice,
      locationId: tenant.locations.find((location) => location.isDefault)?.id,
    })
      .then(setAvailability)
      .catch((error) => { setAvailability(null); toast.error(error instanceof Error ? error.message : 'No pudimos consultar los horarios'); })
      .finally(() => setAvailabilityLoading(false));
  }, [barberChoice, date, serviceId, tenant.locations]);

  const selectedService = services.find((item) => item.id === serviceId) ?? null;
  const selectedBarber = barberChoice && barberChoice !== 'any' ? barbers.find((item) => item.id === barberChoice) ?? null : null;
  const isCustomCut = /personalizado/i.test(selectedService?.name ?? '');
  const summary = useMemo(() => ({
    service: selectedService?.name ?? 'Falta elegir corte',
    barber: barberChoice === 'any' ? 'Primero disponible' : selectedBarber?.name ?? 'Falta elegir barbero',
  }), [barberChoice, selectedBarber, selectedService]);

  function selectService(id: string) {
    if (id !== serviceId) { setBarberChoice(null); setSlot(null); setAvailability(null); setFile(null); }
    setServiceId(id);
  }

  function selectBarber(value: BarberChoice) {
    if (value !== barberChoice) { setSlot(null); setAvailability(null); }
    setBarberChoice(value);
  }

  function next() {
    if (step === 1 && !serviceId) return;
    if (step === 2 && !barberChoice) return;
    if (step === 3 && !slot) return;
    if (step === 2) refreshAvailability(date);
    setStep((value) => Math.min(4, value + 1));
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  function back() {
    setStep((value) => Math.max(1, value - 1));
    window.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  async function handleFile(nextFile: File | null) {
    if (!nextFile) { setFile(null); setErrors((current) => ({ ...current, file: '' })); return; }
    try {
      const prepared = await prepareReferenceImage(nextFile);
      if (prepared.size > 5 * 1024 * 1024) throw new Error('La foto sigue siendo demasiado grande');
      setFile(prepared);
      setErrors((current) => ({ ...current, file: '' }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos preparar la foto';
      setErrors((current) => ({ ...current, file: message }));
      toast.error(message);
    }
  }

  function validateDetails() {
    const nextErrors: Record<string, string> = {};
    if (customer.name.trim().length < 2) nextErrors.name = 'Escribe tu nombre completo';
    if (customer.phone.replace(/\D/g, '').length < 7) nextErrors.phone = 'Escribe un teléfono válido';
    if (customer.email && !/^\S+@\S+\.\S+$/.test(customer.email)) nextErrors.email = 'Escribe un correo válido';
    if (!customer.consent) nextErrors.consent = 'Marca la casilla para que podamos gestionar tu cita';
    if (file && file.size > 5 * 1024 * 1024) nextErrors.file = 'La imagen debe pesar menos de 5 MB';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function submit() {
    if (!selectedService || !barberChoice || !slot || !validateDetails()) return;
    setSubmitting(true);
    try {
      const booking = await createAppointment({
        locationId: availability?.location.id,
        barberId: barberChoice === 'any' ? null : barberChoice,
        serviceIds: [selectedService.id],
        date,
        startTime: slot.start,
        customer: { name: customer.name.trim(), phone: customer.phone.trim(), email: customer.email.trim() || undefined, notes: customer.notes.trim() || undefined, consent: true },
        paymentMethod,
      });
      if (file) {
        try { await uploadReferenceImage(booking.manageToken, file); }
        catch { toast.error('La cita quedó lista, pero no pudimos adjuntar la foto'); }
      }
      setResult(booking);
      toast.success('Tu cita quedó apartada');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'SLOT_UNAVAILABLE') {
        setStep(3);
        refreshAvailability();
        toast.error('Alguien tomó esa hora justo antes. Ya actualizamos las disponibles.');
      } else {
        toast.error(error instanceof Error ? error.message : 'No pudimos completar la reserva');
      }
    } finally { setSubmitting(false); }
  }

  function downloadCalendar() {
    if (!result) return;
    const appointment = result.appointment;
    const location = appointment.location.address || appointment.location.name;
    const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Blades Barbería//Cita//ES', 'BEGIN:VEVENT', `UID:${appointment.id}@blades.mx`, `DTSTAMP:${calendarStamp(new Date())}`, `DTSTART:${calendarStamp(new Date(appointment.startsAt))}`, `DTEND:${calendarStamp(new Date(appointment.endsAt))}`, `SUMMARY:${appointment.service.name} — ${tenant.name}`, `LOCATION:${location.replace(/,/g, '\\,')}`, `DESCRIPTION:Administra tu cita: ${window.location.origin}${result.manageUrl}`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar;charset=utf-8' }));
    link.download = 'cita-blades.ics';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  if (loading) return <PageSpinner />;
  if (!tenant.bookingAvailable) return <div className="section-container py-20 text-center"><CalendarCheck2 className="mx-auto h-12 w-12 text-[var(--accent)]" /><h1 className="mt-5 text-3xl font-black">La agenda está pausada por el momento</h1><p className="mx-auto mt-3 max-w-md text-[#587078]">Estamos actualizando los horarios. Intenta más tarde o contáctanos directamente.</p><Link to="/contact" className="mt-7 inline-flex min-h-12 items-center rounded-xl bg-[var(--brand)] px-6 font-bold text-white">Ver contacto</Link></div>;

  if (result) {
    const appointment = result.appointment;
    const address = appointment.location.address || appointment.location.name;
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    return (
      <div className="section-container py-10 sm:py-16">
        <div className="mx-auto max-w-2xl overflow-hidden rounded-2xl border border-[#17313a]/10 bg-white shadow-lg">
          <div className="bg-[#e8f7ed] p-6 text-center sm:p-8"><span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-emerald-600 text-white"><CheckCircle2 className="h-9 w-9" /></span><p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-emerald-800">Cita confirmada</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">¡Listo, {customer.name.split(' ')[0]}!</h1><p className="mt-2 text-sm text-emerald-900/75">Guarda esta información para cuando la necesites.</p></div>
          <div className="p-5 sm:p-8">
            <div className="grid gap-4 rounded-2xl bg-[#f7f4ed] p-5 sm:grid-cols-2"><div><p className="text-xs font-black uppercase text-[#6b7e84]">Servicio</p><p className="mt-1 font-black">{appointment.service.name}</p><p className="mt-1 text-sm text-[#587078]">con {appointment.barber.name}</p></div><div><p className="text-xs font-black uppercase text-[#6b7e84]">Fecha y hora</p><p className="mt-1 font-black capitalize">{formatDateLong(new Date(`${date}T12:00:00`))}</p><p className="mt-1 text-sm text-[#587078]">{formatTime(appointment.startTime)}</p></div><div><p className="text-xs font-black uppercase text-[#6b7e84]">Total</p><p className="mt-1 font-black text-[var(--accent)]">{formatPrice(appointment.totalCents / 100)} · {paymentMethod === 'CASH' ? 'pago en el local' : 'pago en línea'}</p></div><div><p className="text-xs font-black uppercase text-[#6b7e84]">Código</p><p className="mt-1 font-mono font-black">{appointment.id.slice(0, 8).toUpperCase()}</p></div></div>
            <a href={mapsUrl} target="_blank" rel="noreferrer" className="mt-4 flex items-start gap-2 rounded-xl border border-[#17313a]/10 p-4 text-sm font-semibold text-[#38545d] hover:bg-[#eaf4f5]"><MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)]" /> {address}</a>
            {paymentMethod === 'ONLINE' && <p className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">Tu cita ya está apartada. Sigue las instrucciones del proveedor para terminar el pago seguro.</p>}
            <div className="mt-6 grid gap-3 sm:grid-cols-2"><a href={result.manageUrl} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[var(--brand)] px-5 font-black text-white">Ver o cambiar mi cita</a><button type="button" onClick={downloadCalendar} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-[#17313a]/15 bg-white px-5 font-black"><CalendarPlus className="h-5 w-5" /> Guardar en calendario</button></div>
            <Link to="/" className="mt-5 block text-center text-sm font-bold text-[#587078] hover:text-[var(--brand)]">Volver al inicio</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="section-container py-6 sm:py-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-5 text-center sm:mb-7"><p className="text-xs font-black uppercase tracking-[0.18em] text-[var(--accent)]">Agenda en pocos pasos</p><h1 className="mt-2 text-3xl font-black tracking-tight sm:text-4xl">Aparta tu próxima cita</h1></div>
        <BookingProgress current={step} />

        <div className="mb-4 rounded-xl border border-[#17313a]/10 bg-white p-3 lg:hidden" aria-label="Resumen de reserva"><div className="flex items-center gap-3"><Scissors className="h-5 w-5 shrink-0 text-[var(--accent)]" /><p className="min-w-0 flex-1 truncate text-sm font-bold">{summary.service} · {summary.barber}</p>{selectedService && <span className="shrink-0 text-sm font-black text-[var(--accent)]">{formatPrice(selectedService.price)}</span>}</div></div>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
          <section className="min-w-0 rounded-2xl border border-[#17313a]/10 bg-white p-5 shadow-sm sm:p-7" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={step} initial={reducedMotion ? false : { opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={reducedMotion ? undefined : { opacity: 0, x: -10 }} transition={{ duration: .18 }}>
                {step === 1 && <ServiceStep services={services} selectedId={serviceId} onSelect={selectService} />}
                {step === 2 && <BarberStep barbers={barbers.filter((barber) => !serviceId || barber.serviceIds.includes(serviceId))} selected={barberChoice} onSelect={selectBarber} />}
                {step === 3 && <TimeStep date={date} onDate={(value) => { setDate(value); refreshAvailability(value); }} availability={availability} loading={availabilityLoading} selected={slot} onSelect={setSlot} onRefresh={() => refreshAvailability(date)} />}
                {step === 4 && <DetailsStep value={customer} errors={errors} onChange={setCustomer} paymentMethod={paymentMethod} onPayment={setPaymentMethod} file={file} onFile={handleFile} showReferenceUpload={isCustomCut} />}
              </motion.div>
            </AnimatePresence>

            <div className="mt-7 grid grid-cols-[auto_1fr] gap-2 border-t border-[#17313a]/10 pt-5 sm:flex sm:items-center sm:justify-between">
              <Button type="button" variant="ghost" onClick={back} disabled={step === 1} className="px-3"><ArrowLeft className="h-4 w-4" /> <span className="hidden min-[360px]:inline">Atrás</span></Button>
              {step < 4 ? <Button type="button" onClick={next} className="w-full sm:w-auto" disabled={(step === 1 && !serviceId) || (step === 2 && !barberChoice) || (step === 3 && !slot)}>Continuar <ArrowRight className="h-4 w-4" /></Button> : <Button type="button" onClick={submit} loading={submitting} className="w-full sm:w-auto">Confirmar cita <CheckCircle2 className="h-4 w-4" /></Button>}
            </div>
          </section>

          <aside className="hidden h-fit rounded-2xl bg-[var(--brand)] p-5 text-white lg:sticky lg:top-24 lg:block" aria-label="Resumen de reserva">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--brand-soft)]">Tu cita</p><dl className="mt-5 space-y-4 text-sm"><div><dt className="text-white/60">Corte</dt><dd className="mt-1 font-bold">{summary.service}</dd></div><div><dt className="text-white/60">Barbero</dt><dd className="mt-1 font-bold">{summary.barber}</dd></div>{slot && <div><dt className="text-white/60">Día y hora</dt><dd className="mt-1 font-bold capitalize">{formatDateLong(new Date(`${date}T12:00:00`))}<br />{formatTime(slot.start)}</dd></div>}</dl>{selectedService && <div className="mt-6 flex items-end justify-between border-t border-white/15 pt-5"><span className="text-sm text-white/70">Total</span><span className="text-2xl font-black">{formatPrice(selectedService.price)}</span></div>}
          </aside>
        </div>
      </div>
    </div>
  );
}
