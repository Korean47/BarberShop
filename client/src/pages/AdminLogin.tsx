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
    <main className="grid min-h-screen bg-[#f4f7f7] lg:grid-cols-[.9fr_1.1fr]">
      <section className="hidden overflow-hidden bg-[#0f4c5c] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="flex items-center gap-3 text-2xl font-black"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[#f2c14e] text-[#17313a]"><Scissors className="h-5 w-5" /></span> Blades</div>
        <div className="max-w-lg"><p className="text-xs font-black uppercase tracking-wider text-[#f2c14e]">Operación diaria</p><h1 className="mt-4 text-5xl font-black leading-[1.02] tracking-tight">La agenda y el negocio, en orden.</h1><p className="mt-5 max-w-md text-base leading-7 text-white/70">Consulta citas, clientes, pagos e inventario desde un panel claro para todo el equipo.</p></div>
        <p className="flex items-center gap-2 text-xs text-white/60"><ShieldCheck className="h-4 w-4" /> Sesión protegida y acceso solo para el equipo</p>
      </section>
      <section className="flex items-center justify-center p-5 sm:p-10">
        <form onSubmit={submit} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-lg sm:p-9">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#eaf4f5] text-[#0f4c5c]"><LockKeyhole className="h-5 w-5" /></span>
          <h1 className="mt-6 text-3xl font-black tracking-tight">Acceso del equipo</h1>
          <p className="mt-2 text-sm text-slate-600">Usa las credenciales que te dio el propietario.</p>
          <div className="mt-7 space-y-5">
            <Input label="Correo" type="email" autoComplete="username" value={email} onChange={(event) => setEmail(event.target.value)} required />
            <Input label="Contraseña" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required />
          </div>
          {error && <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <Button type="submit" className="mt-6 w-full" size="lg" loading={submitting}>Iniciar sesión</Button>
          <a href="/" className="mt-5 block text-center text-sm font-bold text-slate-600 hover:text-[#0f4c5c]">Volver al sitio público</a>
        </form>
      </section>
    </main>
  );
}
