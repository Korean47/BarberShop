import { useState } from 'react';
import type { FormEvent } from 'react';
import { CalendarSearch, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { accessAppointment } from '../services/api';
import { useTenant } from '../hooks/useTenant';

export function AppointmentLookup() {
  const navigate = useNavigate();
  const { tenant } = useTenant();
  const [publicCode, setPublicCode] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    try {
      const result = await accessAppointment(publicCode, phone);
      navigate(result.manageUrl, { replace: true });
    } catch {
      toast.error('No encontramos una cita con esos datos. Revisa el código y el teléfono.');
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
          <p className="mt-4 max-w-md leading-7 text-white/72">Usa el código incluido en tu confirmación y el mismo teléfono que registraste.</p>
          <p className="mt-8 flex items-start gap-3 text-sm leading-6 text-white/65"><ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" /> El teléfono por sí solo no permite consultar citas. Limitamos los intentos para proteger tu información.</p>
        </div>
        <form onSubmit={submit} className="p-7 sm:p-10 lg:p-12" noValidate>
          <h2 className="text-2xl font-semibold">Datos de la cita</h2>
          <div className="mt-7 space-y-5">
            <Input label="Código de cita" value={publicCode} onChange={(event) => setPublicCode(event.target.value.toUpperCase())} autoComplete="off" placeholder="Ej. A1B2C3D4" maxLength={12} required />
            <Input label="Teléfono asociado" value={phone} onChange={(event) => setPhone(event.target.value)} type="tel" inputMode="tel" autoComplete="tel" required />
          </div>
          <Button type="submit" className="mt-7 w-full" loading={loading} disabled={publicCode.trim().length < 6 || phone.replace(/\D/g, '').length < 7}>Consultar cita</Button>
          <p className="mt-5 text-sm leading-6 text-[var(--muted)]">Si no tienes el código, comunícate con {tenant.name}{tenant.contactPhone ? ` al ${tenant.contactPhone}` : ''}.</p>
        </form>
      </div>
    </div>
  );
}
