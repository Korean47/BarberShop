import { useState } from 'react';
import type { FormEvent } from 'react';
import { CalendarSearch, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { accessAppointment } from '../services/api';
import type { AppointmentAccessMatch } from '../services/api';
import { useTenant } from '../hooks/useTenant';
import { formatTime } from '../utils/helpers';

export function AppointmentLookup() {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [matches, setMatches] = useState<AppointmentAccessMatch[]>([]);
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setMatches([]);
    try {
      const result = await accessAppointment(phone, date);
      if (result.matches.length === 1) navigate(result.matches[0].manageUrl, { replace: true });
      else setMatches(result.matches);
    } catch {
      toast.error('No encontramos una cita con esos datos. Revisa el teléfono y la fecha.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="section-container py-12 sm:py-20">
      <div className="mx-auto grid max-w-5xl overflow-hidden rounded-[1.5rem] border border-[var(--stone)] bg-[var(--surface-light)] lg:grid-cols-[.9fr_1.1fr]">
        <div className="bg-[var(--primary)] p-7 text-white sm:p-10 lg:p-12">
          <CalendarSearch className="h-10 w-10 text-[#D7D0C6]" />
          <h1 className="mt-7 font-display text-4xl font-semibold tracking-tight sm:text-5xl">Consultar mi cita</h1>
          <p className="mt-4 max-w-md leading-7 text-white/72">Ingresa el mismo teléfono que registraste y la fecha programada de tu cita.</p>
          <p className="mt-8 flex items-start gap-3 text-sm leading-6 text-white/65"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" /> Solicitamos ambos datos y limitamos los intentos para proteger tu información.</p>
        </div>
        <form onSubmit={submit} className="p-7 sm:p-10 lg:p-12" noValidate>
          <h2 className="text-2xl font-semibold">Datos de la cita</h2>
          <div className="mt-7 space-y-5">
            <Input label="Número de teléfono" value={phone} onChange={(event) => { setPhone(event.target.value); setMatches([]); }} type="tel" inputMode="tel" autoComplete="tel" placeholder="Ej. 662 123 4567" required />
            <Input label="Fecha de la cita" value={date} onChange={(event) => { setDate(event.target.value); setMatches([]); }} type="date" autoComplete="off" required />
          </div>
          <Button type="submit" className="mt-7 w-full" loading={loading} disabled={date.length !== 10 || phone.replace(/\D/g, '').length < 10}>Consultar cita</Button>
          {matches.length > 1 && <section className="mt-7" aria-live="polite"><h3 className="font-semibold">Selecciona tu horario</h3><p className="mt-1 text-sm text-[var(--muted)]">Encontramos {matches.length} citas con esos datos.</p><div className="mt-4 space-y-3">{matches.map((match) => <button key={match.appointment.id} type="button" onClick={() => navigate(match.manageUrl, { replace: true })} className="flex min-h-16 w-full items-center justify-between gap-4 rounded-xl border border-[var(--stone)] px-4 text-left transition hover:border-[var(--primary)] hover:bg-[#E9F1F2]"><span><strong className="block">{formatTime(match.appointment.startTime)}</strong><span className="mt-1 block text-xs text-[var(--muted)]">{match.appointment.services.map(({ name }) => name).join(' + ')} · {match.appointment.barber.name}</span></span><span className="text-sm font-semibold text-[var(--primary)]">Ver cita</span></button>)}</div></section>}
          <p className="mt-5 text-sm leading-6 text-[var(--muted)]">Si los datos no coinciden, comunícate con {tenant.name}{tenant.contactPhone ? ` al ${tenant.contactPhone}` : ''}.</p>
        </form>
      </div>
    </div>
  );
}
