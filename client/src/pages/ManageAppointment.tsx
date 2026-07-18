import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, CheckCircle2, Clock3, MapPin, Scissors, ShieldCheck, XCircle } from 'lucide-react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { TimeStep } from '../components/booking/TimeStep';
import { Button } from '../components/ui/Button';
import { PageSpinner } from '../components/ui/Spinner';
import { useTenant } from '../hooks/useTenant';
import { cancelManagedAppointment, getAvailability, getManagedAppointment, rescheduleManagedAppointment } from '../services/api';
import type { Appointment, AvailabilityResponse, AvailabilitySlot } from '../types';
import { formatDateLong, formatDateToAPI, formatPrice, formatTime } from '../utils/helpers';

export function ManageAppointment() {
  const { token = '' } = useParams();
  const [searchParams] = useSearchParams();
  const { tenant } = useTenant();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [date, setDate] = useState(formatDateToAPI(new Date()));
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [slot, setSlot] = useState<AvailabilitySlot | null>(null);
  const [openedAt] = useState(() => new Date());

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const load = async () => {
      try {
        const value = await getManagedAppointment(token);
        if (cancelled) return;
        setAppointment(value);
        attempts += 1;
        if (searchParams.get('payment') === 'success' && value.status === 'pending' && attempts < 5) {
          window.setTimeout(() => void load(), 1200);
        }
      } catch (error) {
        if (!cancelled) toast.error(error instanceof Error ? error.message : 'El enlace ya no es válido');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [searchParams, token]);

  const location = tenant.locations.find((item) => item.id === appointment?.location.id) ?? tenant.locations.find((item) => item.isDefault) ?? tenant.locations[0];
  const modifiable = useMemo(() => appointment ? new Date(appointment.startsAt).getTime() - openedAt.getTime() >= tenant.bookingRules.changeCutoffHours * 60 * 60 * 1000 : false, [appointment, openedAt, tenant.bookingRules.changeCutoffHours]);

  async function refreshAvailability(targetDate = date) {
    if (!appointment) return;
    setAvailabilityLoading(true);
    setSlot(null);
    try {
      setAvailability(await getAvailability({ date: targetDate, serviceIds: appointment.services.map((service) => service.id), barberId: appointment.barberId, locationId: appointment.location.id }));
    } catch (error) {
      setAvailability(null);
      toast.error(error instanceof Error ? error.message : 'No pudimos cargar los horarios');
    } finally {
      setAvailabilityLoading(false);
    }
  }

  async function cancel() {
    if (!appointment || !window.confirm('¿Deseas cancelar esta cita? El horario volverá a estar disponible.')) return;
    const reason = window.prompt('Motivo de cancelación (opcional)') ?? undefined;
    setWorking(true);
    try {
      const updated = await cancelManagedAppointment(token, reason);
      setAppointment(updated);
      setRescheduling(false);
      toast.success('Cita cancelada');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos cancelar la cita');
    } finally { setWorking(false); }
  }

  async function reschedule() {
    if (!slot) return;
    setWorking(true);
    try {
      const updated = await rescheduleManagedAppointment(token, date, slot.start);
      setAppointment(updated);
      setRescheduling(false);
      setSlot(null);
      toast.success('Cita reprogramada');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ese horario ya no está disponible');
      await refreshAvailability();
    } finally { setWorking(false); }
  }

  if (loading) return <PageSpinner />;
  if (!appointment) return <div className="section-container py-20 text-center"><ShieldCheck className="mx-auto h-12 w-12 text-[var(--primary)]" /><h1 className="mt-5 font-display text-4xl font-semibold">Este enlace ya no está disponible</h1><p className="mt-3 text-[var(--muted)]">Consulta la cita nuevamente con el teléfono asociado y la fecha reservada.</p><Link to="/appointment" className="button-secondary mt-7">Consultar mi cita</Link></div>;

  const final = ['cancelled', 'completed', 'no_show'].includes(appointment.status);
  const pendingPayment = appointment.status === 'pending' && appointment.payment?.method === 'online';
  const paymentLabel = appointment.payment?.method !== 'online'
    ? 'En el local'
    : appointment.payment.status === 'paid'
      ? 'Pagado en línea'
      : appointment.payment.status === 'failed'
        ? 'Pago rechazado'
        : appointment.payment.status === 'refunded'
          ? 'Pago reembolsado'
          : appointment.payment.status === 'cancelled'
            ? 'Pago cancelado'
            : 'En línea, pendiente';
  const mapsUrl = appointment.location.mapsUrl || location?.mapsUrl || tenant.branding?.mapUrl;

  return (
    <div className="section-container py-10 sm:py-16">
      <div className="mx-auto max-w-4xl">
        <div className="text-center">{appointment.status === 'cancelled' ? <XCircle className="mx-auto h-14 w-14 text-[var(--error)]" /> : <CheckCircle2 className="mx-auto h-14 w-14 text-[var(--success)]" />}<p className="mt-5 eyebrow">Mi cita</p><h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">{appointment.status === 'cancelled' ? 'Cita cancelada' : pendingPayment ? 'Pago pendiente' : 'Detalles de la cita'}</h1><p className="mt-3 text-sm text-[var(--muted)]">Código <strong className="font-mono tracking-wider text-[var(--text)]">{appointment.publicCode}</strong></p></div>

        <div className="mt-8 rounded-[1.5rem] border border-[var(--stone)] bg-[var(--surface-light)] p-5 shadow-sm sm:p-8">
          <div className="flex items-center gap-4 border-b border-[var(--stone)] pb-5"><img src={appointment.barber.photo} alt={`Retrato de ${appointment.barber.name}`} className="h-16 w-16 rounded-2xl object-cover" /><div className="min-w-0"><p className="truncate font-semibold">{appointment.barber.name}</p><p className="mt-1 truncate text-sm text-[var(--muted)]">{appointment.service.name}</p></div><p className="ml-auto shrink-0 text-xl font-semibold text-[var(--accent)]">{formatPrice(appointment.totalCents / 100)}</p></div>
          <div className="grid gap-5 py-6 sm:grid-cols-2"><p className="detail-row"><CalendarDays /><span><strong>Fecha</strong>{formatDateLong(new Date(appointment.startsAt))}</span></p><p className="detail-row"><Clock3 /><span><strong>Hora</strong>{formatTime(appointment.startTime)}–{formatTime(appointment.endTime)}</span></p><p className="detail-row"><MapPin /><span><strong>Ubicación</strong>{appointment.location.name}</span></p><p className="detail-row"><Scissors /><span><strong>Pago</strong>{paymentLabel}</span></p></div>
          {mapsUrl && <a href={mapsUrl} target="_blank" rel="noreferrer" className="text-link">Cómo llegar</a>}

          {pendingPayment && <div className="mt-5 rounded-xl bg-[#FFF5EA] p-4 text-sm leading-6">La cita se confirma cuando el proveedor valida el pago. Si el checkout se abandona o vence, el horario se libera automáticamente.</div>}
          {!final && !modifiable && <div className="mt-5 rounded-xl border border-[var(--stone)] bg-[var(--background)] p-4 text-sm leading-6"><strong className="block">El plazo de cambios terminó.</strong>Esta cita ya no puede modificarse desde el sitio porque está próxima a comenzar. Comunícate con la barbería para solicitar ayuda.{tenant.contactPhone && <a href={`tel:${tenant.contactPhone}`} className="mt-2 block font-semibold text-[var(--primary)]">{tenant.contactPhone}</a>}</div>}

          {!final && modifiable && !rescheduling && <div className="mt-6 flex flex-col gap-3 border-t border-[var(--stone)] pt-5 sm:flex-row"><Button className="flex-1" onClick={() => { setSlot(null); setRescheduling(true); void refreshAvailability(date); }}>Reprogramar</Button><Button className="flex-1" variant="danger" onClick={() => void cancel()} loading={working}>Cancelar cita</Button></div>}
        </div>

        {rescheduling && <div className="mt-5 rounded-[1.5rem] border border-[var(--stone)] bg-[var(--surface-light)] p-5 sm:p-8"><TimeStep date={date} onDate={(value) => { setDate(value); void refreshAvailability(value); }} availability={availability} loading={availabilityLoading} selected={slot} onSelect={setSlot} onRefresh={() => void refreshAvailability(date)} maxAdvanceDays={tenant.bookingRules.maxAdvanceDays} schedules={location?.businessSchedules || []} exceptions={location?.scheduleExceptions || []} /><div className="mt-6 flex justify-end gap-3 border-t border-[var(--stone)] pt-5"><Button variant="ghost" onClick={() => setRescheduling(false)}>Volver</Button><Button onClick={() => void reschedule()} disabled={!slot} loading={working}>Guardar horario</Button></div></div>}
      </div>
    </div>
  );
}
