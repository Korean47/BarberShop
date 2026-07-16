import { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { ArrowLeft, ArrowRight, CalendarCheck2, CheckCircle2, MapPin } from 'lucide-react';
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

const emptyCustomer: CustomerForm = { name: '', phone: '', email: '', notes: '', consent: false };

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
      .catch(() => toast.error('No pudimos cargar la agenda'))
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
      .catch((error) => {
        setAvailability(null);
        toast.error(error instanceof Error ? error.message : 'No pudimos consultar los horarios');
      })
      .finally(() => setAvailabilityLoading(false));
  }, [barberChoice, date, serviceId, tenant.locations]);

  const selectedService = services.find((item) => item.id === serviceId) ?? null;
  const selectedBarber = barberChoice && barberChoice !== 'any' ? barbers.find((item) => item.id === barberChoice) ?? null : null;
  const summary = useMemo(() => ({
    service: selectedService?.name ?? 'Elige un servicio',
    barber: barberChoice === 'any' ? 'Cualquier barbero' : selectedBarber?.name ?? 'Por elegir',
  }), [barberChoice, selectedBarber, selectedService]);

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

  function validateDetails() {
    const nextErrors: Record<string, string> = {};
    if (customer.name.trim().length < 2) nextErrors.name = 'Escribe tu nombre completo';
    if (customer.phone.replace(/\D/g, '').length < 7) nextErrors.phone = 'Escribe un teléfono válido';
    if (customer.email && !/^\S+@\S+\.\S+$/.test(customer.email)) nextErrors.email = 'Escribe un correo válido';
    if (!customer.consent) nextErrors.consent = 'Necesitamos tu autorización para gestionar la cita';
    if (file && file.size > 5 * 1024 * 1024) nextErrors.file = 'La imagen debe pesar menos de 5 MB';
    if (file && !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) nextErrors.file = 'Usa una imagen JPG, PNG o WebP';
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
        customer: {
          name: customer.name,
          phone: customer.phone,
          email: customer.email || undefined,
          notes: customer.notes || undefined,
          consent: true,
        },
        paymentMethod,
      });
      if (file) {
        try {
          await uploadReferenceImage(booking.manageToken, file);
        } catch {
          toast.error('La cita quedó lista, pero no pudimos adjuntar la imagen');
        }
      }
      setResult(booking);
      toast.success('Tu cita quedó reservada');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      if (error instanceof ApiError && error.code === 'SLOT_UNAVAILABLE') {
        setStep(3);
        refreshAvailability();
      }
      toast.error(error instanceof Error ? error.message : 'No pudimos completar la reserva');
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <PageSpinner />;
  if (!tenant.bookingAvailable) {
    return (
      <div className="section-container py-24 text-center">
        <CalendarCheck2 className="mx-auto h-12 w-12 text-[var(--brand)]" />
        <h1 className="mt-5 font-display text-4xl font-semibold">Agenda temporalmente pausada</h1>
        <p className="mx-auto mt-3 max-w-md text-[#657069]">La barbería está actualizando su servicio. Intenta de nuevo más tarde o contáctanos directamente.</p>
        <Link to="/contact" className="mt-7 inline-block rounded-full bg-[var(--brand-dark)] px-6 py-3 font-semibold text-white">Ver contacto</Link>
      </div>
    );
  }

  if (result) {
    const appointment = result.appointment;
    return (
      <div className="section-container py-16 sm:py-24">
        <div className="mx-auto max-w-xl rounded-[2rem] bg-white p-7 text-center shadow-xl sm:p-10">
          <span className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-emerald-100 text-emerald-700"><CheckCircle2 className="h-10 w-10" /></span>
          <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand)]">Reserva confirmada</p>
          <h1 className="mt-2 font-display text-4xl font-semibold">Nos vemos pronto, {customer.name.split(' ')[0]}</h1>
          <div className="mt-7 rounded-2xl bg-[#f6f2ea] p-5 text-left">
            <p className="font-bold">{appointment.service.name} con {appointment.barber.name}</p>
            <p className="mt-2 text-sm text-[#657069]">{formatDateLong(new Date(`${date}T12:00:00`))} · {formatTime(appointment.startTime)}</p>
            <p className="mt-1 flex items-center gap-1 text-sm text-[#657069]"><MapPin className="h-4 w-4" /> {appointment.location.name}</p>
          </div>
          {paymentMethod === 'ONLINE' && <p className="mt-5 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">El pago en línea quedó iniciado. Sigue las instrucciones del proveedor seguro para completarlo.</p>}
          <a href={result.manageUrl} className="mt-7 inline-flex min-h-12 items-center justify-center rounded-full bg-[var(--brand-dark)] px-6 font-semibold text-white">Administrar mi cita</a>
          <Link to="/" className="mt-4 block text-sm font-semibold text-[#657069] hover:text-[#17211d]">Volver al inicio</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="section-container py-10 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand)]">Reserva en menos de dos minutos</p>
          <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">Tu próxima cita, sin llamadas</h1>
        </div>
        <BookingProgress current={step} />

        <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
          <section className="min-w-0 rounded-[2rem] bg-[#fbf8f2] p-5 shadow-sm sm:p-8" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={step} initial={reducedMotion ? false : { opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={reducedMotion ? undefined : { opacity: 0, x: -12 }} transition={{ duration: .2 }}>
                {step === 1 && <ServiceStep services={services} selectedId={serviceId} onSelect={setServiceId} />}
                {step === 2 && <BarberStep barbers={barbers.filter((barber) => !serviceId || barber.serviceIds.includes(serviceId))} selected={barberChoice} onSelect={setBarberChoice} />}
                {step === 3 && <TimeStep date={date} onDate={(value) => { setDate(value); refreshAvailability(value); }} availability={availability} loading={availabilityLoading} selected={slot} onSelect={setSlot} onRefresh={() => refreshAvailability(date)} />}
                {step === 4 && <DetailsStep value={customer} errors={errors} onChange={setCustomer} paymentMethod={paymentMethod} onPayment={setPaymentMethod} file={file} onFile={setFile} />}
              </motion.div>
            </AnimatePresence>

            <div className="mt-8 flex items-center justify-between border-t border-[#17211d]/10 pt-5">
              <Button type="button" variant="ghost" onClick={back} disabled={step === 1}><ArrowLeft className="h-4 w-4" /> Atrás</Button>
              {step < 4 ? (
                <Button type="button" onClick={next} disabled={(step === 1 && !serviceId) || (step === 2 && !barberChoice) || (step === 3 && !slot)}>
                  Continuar <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="button" onClick={submit} loading={submitting}>Confirmar cita <CheckCircle2 className="h-4 w-4" /></Button>
              )}
            </div>
          </section>

          <aside className="h-fit rounded-[1.5rem] bg-[var(--brand-dark)] p-5 text-white lg:sticky lg:top-24" aria-label="Resumen de reserva">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--brand-soft)]">Tu reserva</p>
            <dl className="mt-5 space-y-4 text-sm">
              <div><dt className="text-white/50">Servicio</dt><dd className="mt-1 font-semibold">{summary.service}</dd></div>
              <div><dt className="text-white/50">Profesional</dt><dd className="mt-1 font-semibold">{summary.barber}</dd></div>
              {slot && <div><dt className="text-white/50">Fecha y hora</dt><dd className="mt-1 font-semibold">{formatDateLong(new Date(`${date}T12:00:00`))}<br />{formatTime(slot.start)}</dd></div>}
            </dl>
            {selectedService && <div className="mt-6 flex items-end justify-between border-t border-white/10 pt-5"><span className="text-sm text-white/60">Total</span><span className="text-2xl font-bold">{formatPrice(selectedService.price)}</span></div>}
          </aside>
        </div>
      </div>
    </div>
  );
}
