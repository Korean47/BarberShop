import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarDays, CheckCircle2, Clock3, MapPin, Scissors, ShieldCheck, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { PageSpinner } from '../components/ui/Spinner';
import {
  cancelManagedAppointment,
  getAvailability,
  getManagedAppointment,
  rescheduleManagedAppointment,
} from '../services/api';
import type { Appointment, AvailabilityResponse, AvailabilitySlot } from '../types';
import { formatDateLong, formatDateToAPI, formatPrice, formatTime } from '../utils/helpers';

export function ManageAppointment() {
  const { token = '' } = useParams();
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [rescheduling, setRescheduling] = useState(false);
  const [date, setDate] = useState(formatDateToAPI(new Date()));
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null);
  const [slot, setSlot] = useState<AvailabilitySlot | null>(null);

  useEffect(() => {
    getManagedAppointment(token)
      .then(setAppointment)
      .catch((error) => toast.error(error instanceof Error ? error.message : 'El enlace ya no es válido'))
      .finally(() => setLoading(false));
  }, [token]);

  useEffect(() => {
    if (!rescheduling || !appointment) return;
    getAvailability({
      date,
      serviceIds: appointment.services.map((service) => service.id),
      barberId: appointment.barberId,
      locationId: appointment.location.id,
    })
      .then(setAvailability)
      .catch((error) => toast.error(error instanceof Error ? error.message : 'No pudimos cargar horarios'));
  }, [appointment, date, rescheduling]);

  async function cancel() {
    if (!appointment || !window.confirm('¿Seguro que deseas cancelar esta cita?')) return;
    setWorking(true);
    try {
      const updated = await cancelManagedAppointment(token);
      setAppointment(updated);
      toast.success('Cita cancelada');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos cancelar la cita');
    } finally {
      setWorking(false);
    }
  }

  async function reschedule() {
    if (!slot) return;
    setWorking(true);
    try {
      const updated = await rescheduleManagedAppointment(token, date, slot.start);
      setAppointment(updated);
      setRescheduling(false);
      toast.success('Cita reprogramada');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ese horario ya no está disponible');
    } finally {
      setWorking(false);
    }
  }

  if (loading) return <PageSpinner />;
  if (!appointment) {
    return <div className="section-container py-24 text-center"><ShieldCheck className="mx-auto h-12 w-12 text-[var(--brand)]" /><h1 className="mt-5 font-display text-4xl font-semibold">Este enlace ya no está disponible</h1><p className="mt-3 text-[#657069]">Por seguridad, los enlaces para administrar citas caducan.</p><Link to="/contact" className="mt-7 inline-block font-semibold underline">Contactar a la barbería</Link></div>;
  }

  const final = ['cancelled', 'completed', 'no_show'].includes(appointment.status);
  return (
    <div className="section-container py-14 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <div className="text-center">
          {appointment.status === 'cancelled' ? <XCircle className="mx-auto h-14 w-14 text-red-600" /> : <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-700" />}
          <p className="mt-5 text-xs font-bold uppercase tracking-[.2em] text-[var(--brand)]">Tu cita</p>
          <h1 className="mt-2 font-display text-4xl font-semibold">{appointment.status === 'cancelled' ? 'Cita cancelada' : 'Todo listo para tu visita'}</h1>
        </div>
        <div className="mt-8 rounded-[2rem] bg-white p-6 shadow-lg sm:p-8">
          <div className="flex items-center gap-4 border-b border-[#17211d]/10 pb-5">
            <img src={appointment.barber.photo} alt="" className="h-16 w-16 rounded-2xl object-cover" />
            <div><p className="font-bold">{appointment.barber.name}</p><p className="mt-1 text-sm text-[#657069]">{appointment.service.name}</p></div>
            <p className="ml-auto font-display text-2xl font-semibold">{formatPrice(appointment.totalCents / 100)}</p>
          </div>
          <div className="grid gap-4 py-6 sm:grid-cols-2">
            <p className="flex items-start gap-3 text-sm"><CalendarDays className="mt-0.5 h-5 w-5 text-[var(--brand)]" /><span><strong className="block">Fecha</strong>{formatDateLong(new Date(appointment.startsAt))}</span></p>
            <p className="flex items-start gap-3 text-sm"><Clock3 className="mt-0.5 h-5 w-5 text-[var(--brand)]" /><span><strong className="block">Hora</strong>{formatTime(appointment.startTime)} – {formatTime(appointment.endTime)}</span></p>
            <p className="flex items-start gap-3 text-sm"><MapPin className="mt-0.5 h-5 w-5 text-[var(--brand)]" /><span><strong className="block">Sucursal</strong>{appointment.location.name}</span></p>
            <p className="flex items-start gap-3 text-sm"><Scissors className="mt-0.5 h-5 w-5 text-[var(--brand)]" /><span><strong className="block">Pago</strong>{appointment.payment?.method === 'online' ? 'En línea' : 'En el local'}</span></p>
          </div>

          {!final && !rescheduling && (
            <div className="flex flex-col gap-3 border-t border-[#17211d]/10 pt-5 sm:flex-row">
              <Button className="flex-1" onClick={() => { setSlot(null); setRescheduling(true); }}>Reprogramar</Button>
              <Button className="flex-1" variant="danger" onClick={cancel} loading={working}>Cancelar cita</Button>
            </div>
          )}

          {rescheduling && (
            <div className="border-t border-[#17211d]/10 pt-6">
              <h2 className="font-display text-2xl font-semibold">Elige un nuevo horario</h2>
              <input type="date" value={date} min={formatDateToAPI(new Date())} onChange={(event) => { setSlot(null); setDate(event.target.value); }} className="mt-4 min-h-12 rounded-xl border border-[#17211d]/15 px-4" />
              <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5">
                {availability?.slots.map((item) => <button type="button" key={item.start} aria-pressed={slot?.start === item.start} onClick={() => setSlot(item)} className={`min-h-11 rounded-xl border text-sm font-bold ${slot?.start === item.start ? 'border-[var(--brand)] bg-[var(--brand-soft)]' : 'border-[#17211d]/10'}`}>{formatTime(item.start)}</button>)}
              </div>
              {!availability?.slots.length && <p className="mt-4 text-sm text-[#657069]">No hay horarios disponibles para esta fecha.</p>}
              <div className="mt-5 flex gap-3"><Button variant="ghost" onClick={() => setRescheduling(false)}>Volver</Button><Button onClick={reschedule} disabled={!slot} loading={working}>Guardar horario</Button></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
