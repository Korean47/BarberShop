import { Banknote, CreditCard, ShieldCheck } from 'lucide-react';

export function PaymentStep({ value, onChange, cashAvailable, onlineAvailable, provider }: {
  value: 'CASH' | 'ONLINE';
  onChange(value: 'CASH' | 'ONLINE'): void;
  cashAvailable: boolean;
  onlineAvailable: boolean;
  provider: string | null;
}) {
  return (
    <fieldset>
      <legend className="booking-title">Forma de pago</legend>
      <p className="booking-description">El importe se calcula nuevamente en el servidor antes de crear la cita.</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        {cashAvailable && <button type="button" aria-pressed={value === 'CASH'} onClick={() => onChange('CASH')} className={`booking-option min-h-32 p-5 text-left ${value === 'CASH' ? 'booking-option-active' : ''}`}><Banknote className="h-7 w-7 text-[var(--primary)]" /><strong className="mt-4 block">Pago en el local</strong><span className="mt-1 block text-sm leading-6 text-[var(--muted)]">Liquida al terminar el servicio con los métodos disponibles en caja.</span></button>}
        {onlineAvailable && <button type="button" aria-pressed={value === 'ONLINE'} onClick={() => onChange('ONLINE')} className={`booking-option min-h-32 p-5 text-left ${value === 'ONLINE' ? 'booking-option-active' : ''}`}><CreditCard className="h-7 w-7 text-[var(--primary)]" /><strong className="mt-4 block">Pago en línea</strong><span className="mt-1 block text-sm leading-6 text-[var(--muted)]">Continuarás a un checkout seguro. El horario se retiene mientras completas el pago.</span></button>}
      </div>
      {!onlineAvailable && <div className="mt-5 rounded-xl border border-[var(--stone)] bg-[var(--background)] p-4 text-sm leading-6 text-[var(--muted)]">El pago en línea no está habilitado. No se mostrarán botones de pago hasta que la configuración administrativa esté completa.</div>}
      {onlineAvailable && <p className="mt-5 flex items-start gap-2 text-xs leading-5 text-[var(--muted)]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" /> La barbería no recibe ni almacena números de tarjeta o códigos de seguridad. {provider ? `Proveedor ${provider === 'configured' ? 'configurado' : provider}.` : ''}</p>}
    </fieldset>
  );
}
