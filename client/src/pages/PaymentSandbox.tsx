import { useState } from 'react';
import { CreditCard, ShieldCheck } from 'lucide-react';
import { useParams, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Button } from '../components/ui/Button';
import { settleSandboxPayment } from '../services/api';

export function PaymentSandbox() {
  const { paymentId = '' } = useParams();
  const [searchParams] = useSearchParams();
  const [working, setWorking] = useState<'paid' | 'failed' | null>(null);

  async function finish(outcome: 'paid' | 'failed') {
    setWorking(outcome);
    try {
      await settleSandboxPayment(paymentId, outcome);
      const target = searchParams.get(outcome === 'paid' ? 'success' : 'cancel');
      if (target && new URL(target, window.location.origin).origin === window.location.origin) {
        window.location.assign(target);
        return;
      }
      window.location.assign('/');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos completar la prueba');
      setWorking(null);
    }
  }

  return (
    <div className="section-container grid min-h-[70svh] place-items-center py-12">
      <div className="w-full max-w-lg rounded-[1.5rem] border border-[var(--stone)] bg-[var(--surface-light)] p-7 shadow-sm sm:p-10">
        <span className="tag">Entorno de desarrollo</span>
        <CreditCard className="mt-7 h-11 w-11 text-[var(--primary)]" />
        <h1 className="mt-5 font-display text-3xl font-semibold">Prueba de pago</h1>
        <p className="mt-3 leading-7 text-[var(--muted)]">Esta pantalla simula el resultado del proveedor. No solicita ni almacena datos de tarjeta.</p>
        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          <Button onClick={() => void finish('paid')} loading={working === 'paid'} disabled={working !== null}>Aprobar pago</Button>
          <Button variant="outline" onClick={() => void finish('failed')} loading={working === 'failed'} disabled={working !== null}>Simular rechazo</Button>
        </div>
        <p className="mt-6 flex items-start gap-2 text-xs leading-5 text-[var(--muted)]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> En producción, el proveedor alojado procesa la tarjeta y el webhook firmado confirma la cita.</p>
      </div>
    </div>
  );
}
