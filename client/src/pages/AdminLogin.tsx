import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LockKeyhole, Scissors, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';

export function AdminLogin() {
  const { session, loading, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && session) return <Navigate to="/admin" replace />;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      const destination = (location.state as { from?: string } | null)?.from ?? '/admin';
      navigate(destination, { replace: true });
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'No pudimos iniciar sesión');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-[#f5f1e9] lg:grid-cols-2">
      <section className="hidden overflow-hidden bg-[var(--brand-dark)] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3 font-display text-2xl font-semibold"><span className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-[var(--brand-soft)]"><Scissors className="h-5 w-5" /></span> Blades</div>
        <div className="max-w-lg"><p className="text-xs font-bold uppercase tracking-[.22em] text-[var(--brand-soft)]">Operación diaria</p><h1 className="mt-4 font-display text-6xl font-semibold leading-[.95]">Tu negocio,<br />bajo control.</h1><p className="mt-6 max-w-md text-base leading-7 text-white/60">Agenda, clientes y operación en un solo lugar, con acceso aislado para tu barbería.</p></div>
        <p className="flex items-center gap-2 text-xs text-white/50"><ShieldCheck className="h-4 w-4" /> Sesión segura y acciones auditadas</p>
      </section>
      <section className="flex items-center justify-center p-5 sm:p-10">
        <form onSubmit={submit} className="w-full max-w-md rounded-[2rem] bg-white p-7 shadow-xl sm:p-10">
          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#17211d] text-[var(--brand-soft)]"><LockKeyhole className="h-5 w-5" /></span>
          <h1 className="mt-6 font-display text-4xl font-semibold">Acceso del equipo</h1>
          <p className="mt-2 text-sm text-[#657069]">Usa las credenciales asignadas por el propietario.</p>
          <div className="mt-7 space-y-5">
            <Input label="Correo" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <Input label="Contraseña" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
          {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <Button type="submit" className="mt-6 w-full" size="lg" loading={submitting}>Iniciar sesión</Button>
          <a href="/" className="mt-5 block text-center text-sm font-semibold text-[#657069] hover:text-[#17211d]">Volver al sitio público</a>
        </form>
      </section>
    </main>
  );
}
