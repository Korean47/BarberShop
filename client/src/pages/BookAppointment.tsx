import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CalendarPlus, CheckCircle2, ChevronDown, MapPin, X } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BookingProgress } from '../components/booking/BookingProgress';
import { ServiceStep } from '../components/booking/ServiceStep';
import { BarberStep, type BarberChoice } from '../components/booking/BarberStep';
import { TimeStep } from '../components/booking/TimeStep';
import { DetailsStep, type CustomerForm } from '../components/booking/DetailsStep';
import { PaymentStep } from '../components/booking/PaymentStep';
import { ReviewStep } from '../components/booking/ReviewStep';
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
  const contentRef = useRef<HTMLDivElement>(null);
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
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'ONLINE'>(tenant.paymentOptions.cash ? 'CASH' : 'ONLINE');
  const [file, setFile] = useState<File | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<CreateBookingResponse | null>(null);

  useEffect(() => {
    let active = true;
    Promise.all([getServices(), getBarbers()]).then(([serviceList, barberList]) => {
      if (!active) return;
      setServices(serviceList);
      setBarbers(barberList);
      if (initialServiceId && !serviceList.some((item) => item.id === initialServiceId)) setServiceId(null);
      if (initialBarberId && !barberList.some((item) => item.id === initialBarberId)) setBarberChoice(null);
    }).catch(() => toast.error('No pudimos cargar los servicios y horarios')).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [initialBarberId, initialServiceId]);

  const selectedPaymentMethod: 'CASH' | 'ONLINE' = !tenant.paymentOptions.cash && tenant.paymentOptions.online
    ? 'ONLINE'
    : !tenant.paymentOptions.online
      ? 'CASH'
      : paymentMethod;

  const refreshAvailability = useCallback((targetDate = date) => {
    if (!serviceId || !barberChoice) return;
    setAvailabilityLoading(true);
    setSlot(null);
    getAvailability({
      date: targetDate,
      serviceIds: [serviceId],
      barberId: barberChoice === 'any' ? undefined : barberChoice,
      locationId: tenant.locations.find((location) => location.isDefault)?.id,
    }).then(setAvailability).catch((error) => {
      setAvailability(null);
      toast.error(error instanceof Error ? error.message : 'No pudimos consultar los horarios');
    }).finally(() => setAvailabilityLoading(false));
  }, [barberChoice, date, serviceId, tenant.locations]);

  const selectedService = services.find((item) => item.id === serviceId) ?? null;
  const selectedBarber = barberChoice && barberChoice !== 'any' ? barbers.find((item) => item.id === barberChoice) ?? null : null;
  const isCustomCut = /personalizado/i.test(selectedService?.name ?? '');
  const location = tenant.locations.find((item) => item.isDefault) ?? tenant.locations[0];
  const summary = useMemo(() => ({
    service: selectedService?.name ?? 'Servicio pendiente',
    barber: barberChoice === 'any' ? 'Primero disponible' : selectedBarber?.name ?? 'Barbero pendiente',
  }), [barberChoice, selectedBarber, selectedService]);

  function moveTo(nextStep: number) {
    setStep(Math.min(6, Math.max(1, nextStep)));
    contentRef.current?.scrollTo({ top: 0, behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  function selectService(id: string) {
    if (id !== serviceId) { setBarberChoice(null); setSlot(null); setAvailability(null); setFile(null); }
    setServiceId(id);
  }

  function selectBarber(value: BarberChoice) {
    if (value !== barberChoice) { setSlot(null); setAvailability(null); }
    setBarberChoice(value);
  }

  function validateDetails() {
    const nextErrors: Record<string, string> = {};
    if (customer.name.trim().length < 2) nextErrors.name = 'Escribe tu nombre completo';
    if (customer.phone.replace(/\D/g, '').length < 7) nextErrors.phone = 'Escribe un teléfono válido';
    if (customer.email && !/^\S+@\S+\.\S+$/.test(customer.email)) nextErrors.email = 'Escribe un correo válido';
    if (!customer.consent) nextErrors.consent = 'Acepta el uso de datos para gestionar la cita';
    if (file && file.size > 5 * 1024 * 1024) nextErrors.file = 'La imagen debe pesar menos de 5 MB';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  function next() {
    if (step === 1 && !serviceId) return;
    if (step === 2 && !barberChoice) return;
    if (step === 3 && !slot) return;
    if (step === 4 && !validateDetails()) return;
    if (step === 2) refreshAvailability(date);
    moveTo(step + 1);
  }

  async function handleFile(nextFile: File | null) {
    if (!nextFile) { setFile(null); setErrors((current) => ({ ...current, file: '' })); return; }
    try {
      const prepared = await prepareReferenceImage(nextFile);
      if (prepared.size > 5 * 1024 * 1024) throw new Error('La imagen sigue siendo demasiado grande');
      setFile(prepared);
      setErrors((current) => ({ ...current, file: '' }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No pudimos preparar la imagen';
      setErrors((current) => ({ ...current, file: message }));
      toast.error(message);
    }
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
        paymentMethod: selectedPaymentMethod,
      });
      if (file) {
        try { await uploadReferenceImage(booking.manageToken, file); }
        catch { toast.error('La cita fue creada, pero no pudimos adjuntar la imagen'); }
      }
      if (selectedPaymentMethod === 'ONLINE') {
        if (!booking.payment?.checkoutUrl) throw new Error('El checkout no está disponible');
        window.location.assign(booking.payment.checkoutUrl);
        return;
      }
      setResult(booking);
      toast.success('Cita confirmada');
    } catch (error) {
      if (error instanceof ApiError && error.code === 'SLOT_UNAVAILABLE') {
        moveTo(3);
        refreshAvailability();
        toast.error('Ese horario acaba de ocuparse. Selecciona otro de los horarios disponibles.');
      } else {
        toast.error(error instanceof Error ? error.message : 'No pudimos completar la reservación');
      }
    } finally { setSubmitting(false); }
  }

  function downloadCalendar() {
    if (!result) return;
    const appointment = result.appointment;
    const address = appointment.location.address || appointment.location.name;
    const body = ['BEGIN:VCALENDAR', 'VERSION:2.0', `PRODID:-//${tenant.name}//Cita//ES`, 'BEGIN:VEVENT', `UID:${appointment.id}@barbershop.local`, `DTSTAMP:${calendarStamp(new Date())}`, `DTSTART:${calendarStamp(new Date(appointment.startsAt))}`, `DTEND:${calendarStamp(new Date(appointment.endsAt))}`, `SUMMARY:${appointment.service.name} — ${tenant.name}`, `LOCATION:${address.replace(/,/g, '\\,')}`, `DESCRIPTION:Consulta tu cita: ${window.location.origin}/appointment`, 'END:VEVENT', 'END:VCALENDAR'].join('\r\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([body], { type: 'text/calendar;charset=utf-8' }));
    link.download = 'cita.ics';
    link.click();
    URL.revokeObjectURL(link.href);
  }

  if (loading) return <div className="fixed inset-0 z-50 bg-[var(--background)]"><PageSpinner /></div>;
  if (!tenant.bookingAvailable) return <div className="fixed inset-0 z-50 grid place-items-center bg-[var(--background)] p-6 text-center"><div><h1 className="font-display text-3xl font-semibold">La agenda está pausada</h1><p className="mt-3 text-[var(--muted)]">Intenta más tarde o comunícate directamente con la barbería.</p><Link to="/" className="button-secondary mt-7">Volver al inicio</Link></div></div>;

  if (result) {
    const appointment = result.appointment;
    const address = appointment.location.address || appointment.location.name;
    const mapsUrl = appointment.location.mapsUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    return <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--background)]"><div className="section-container grid min-h-full place-items-center py-8"><div className="w-full max-w-2xl overflow-hidden rounded-[1.5rem] border border-[var(--stone)] bg-[var(--surface-light)] shadow-xl"><div className="bg-[#E8F3EC] p-7 text-center sm:p-9"><span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[var(--success)] text-white"><CheckCircle2 className="h-9 w-9" /></span><p className="mt-5 eyebrow text-[var(--success)]">Cita confirmada</p><h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Tu cita quedó registrada</h1></div><div className="p-5 sm:p-8"><dl className="grid gap-4 rounded-2xl bg-[var(--background)] p-5 sm:grid-cols-2"><div><dt className="summary-label">Servicio</dt><dd className="summary-value">{appointment.service.name}</dd><p className="mt-1 text-sm text-[var(--muted)]">{appointment.barber.name}</p></div><div><dt className="summary-label">Fecha y hora</dt><dd className="summary-value capitalize">{formatDateLong(new Date(`${date}T12:00:00`))}</dd><p className="mt-1 text-sm text-[var(--muted)]">{formatTime(appointment.startTime)}</p></div><div><dt className="summary-label">Total</dt><dd className="summary-value text-[var(--accent)]">{formatPrice(appointment.totalCents / 100)} · pago en el local</dd></div><div><dt className="summary-label">Código de cita</dt><dd className="mt-1 font-mono text-xl font-semibold tracking-wider">{appointment.publicCode}</dd></div></dl><a href={mapsUrl} target="_blank" rel="noreferrer" className="mt-4 flex min-h-12 items-center gap-2 rounded-xl border border-[var(--stone)] p-4 text-sm font-semibold"><MapPin className="h-5 w-5 shrink-0 text-[var(--accent)]" /> {address}</a><div className="mt-6 grid gap-3 sm:grid-cols-2"><a href={result.manageUrl} className="button-secondary">Consultar o modificar</a><button type="button" onClick={downloadCalendar} className="button-outline"><CalendarPlus className="h-5 w-5" /> Guardar en calendario</button></div><Link to="/" className="mt-5 block text-center text-sm font-semibold text-[var(--muted)]">Volver al inicio</Link></div></div></div></div>;
  }

  const detailsReady = customer.name.trim().length >= 2
    && customer.phone.replace(/\D/g, '').length >= 7
    && (!customer.email || /^\S+@\S+\.\S+$/.test(customer.email))
    && customer.consent
    && (!file || file.size <= 5 * 1024 * 1024);
  const paymentReady = (selectedPaymentMethod === 'CASH' && tenant.paymentOptions.cash)
    || (selectedPaymentMethod === 'ONLINE' && tenant.paymentOptions.online);
  const canContinue = (step === 1 && !!serviceId)
    || (step === 2 && !!barberChoice)
    || (step === 3 && !!slot)
    || (step === 4 && detailsReady)
    || (step === 5 && paymentReady);

  return (
    <div className="fixed inset-0 z-50 flex min-h-[100dvh] flex-col bg-[var(--background)] lg:p-5">
      <div className="mx-auto flex min-h-0 w-full max-w-7xl flex-1 flex-col overflow-hidden bg-[var(--surface-light)] lg:rounded-[1.5rem] lg:border lg:border-[var(--stone)] lg:shadow-2xl">
        <header className="shrink-0 border-b border-[var(--stone)] bg-[var(--surface-light)] px-4 pb-3 pt-[max(.75rem,env(safe-area-inset-top))] sm:px-6 lg:px-8">
          <div className="flex items-center gap-3"><Link to="/" className="round-control" aria-label="Cerrar reservación"><X className="h-5 w-5" /></Link><div className="min-w-0 flex-1"><p className="text-xs font-semibold uppercase tracking-[.14em] text-[var(--muted)]">Agenda tu cita</p><p className="truncate font-display text-lg font-semibold">{summary.service}</p></div><details className="relative"><summary className="flex min-h-11 cursor-pointer list-none items-center gap-1 rounded-full border border-[var(--stone)] px-3 text-sm font-semibold">Resumen <ChevronDown className="h-4 w-4" /></summary><div className="absolute right-0 top-12 z-20 w-[min(82vw,300px)] rounded-2xl border border-[var(--stone)] bg-white p-4 shadow-xl"><p className="summary-label">Servicio</p><p className="summary-value">{summary.service}</p><p className="summary-label mt-4">Barbero</p><p className="summary-value">{summary.barber}</p>{selectedService && <><p className="summary-label mt-4">Importe</p><p className="summary-value">{formatPrice(selectedService.price)}</p></>}</div></details></div>
          <BookingProgress current={step} />
        </header>

        <div ref={contentRef} className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-7 lg:px-8" aria-live="polite">
          <div className="mx-auto max-w-5xl">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={step} initial={reducedMotion ? false : { opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} exit={reducedMotion ? undefined : { opacity: 0, x: -10 }} transition={{ duration: .16 }}>
                {step === 1 && <ServiceStep services={services} selectedId={serviceId} onSelect={selectService} />}
                {step === 2 && <BarberStep barbers={barbers.filter((barber) => !serviceId || barber.serviceIds.includes(serviceId))} selected={barberChoice} onSelect={selectBarber} />}
                {step === 3 && <TimeStep date={date} onDate={(value) => { setDate(value); refreshAvailability(value); }} availability={availability} loading={availabilityLoading} selected={slot} onSelect={setSlot} onRefresh={() => refreshAvailability(date)} maxAdvanceDays={tenant.bookingRules.maxAdvanceDays} schedules={location?.businessSchedules || []} exceptions={location?.scheduleExceptions || []} />}
                {step === 4 && <DetailsStep value={customer} errors={errors} onChange={setCustomer} file={file} onFile={handleFile} showReferenceUpload={isCustomCut} />}
                {step === 5 && <PaymentStep value={selectedPaymentMethod} onChange={setPaymentMethod} cashAvailable={tenant.paymentOptions.cash} onlineAvailable={tenant.paymentOptions.online} provider={tenant.paymentOptions.provider} />}
                {step === 6 && selectedService && slot && <ReviewStep service={selectedService} barber={selectedBarber} barberIsAny={barberChoice === 'any'} date={date} slot={slot} customerName={customer.name} paymentMethod={selectedPaymentMethod} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        <footer className="shrink-0 border-t border-[var(--stone)] bg-[var(--surface-light)] px-4 pb-[max(.75rem,env(safe-area-inset-bottom))] pt-3 sm:px-6 lg:px-8"><div className="mx-auto flex max-w-5xl items-center gap-3"><Button type="button" variant="ghost" onClick={() => moveTo(step - 1)} disabled={step === 1} className="px-3"><ArrowLeft className="h-4 w-4" /> <span className="hidden min-[360px]:inline">Atrás</span></Button><div className="ml-auto">{step < 6 ? <Button type="button" onClick={next} disabled={!canContinue}>Continuar <ArrowRight className="h-4 w-4" /></Button> : <Button type="button" onClick={() => void submit()} loading={submitting}>Confirmar cita <CheckCircle2 className="h-4 w-4" /></Button>}</div></div></footer>
      </div>
    </div>
  );
}
