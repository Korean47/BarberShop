import { ImagePlus, ShieldCheck, X } from 'lucide-react';
import { Input } from '../ui/Input';

export interface CustomerForm {
  name: string;
  phone: string;
  email: string;
  notes: string;
  consent: boolean;
}

export function DetailsStep({ value, errors, onChange, paymentMethod, onPayment, file, onFile }: {
  value: CustomerForm;
  errors: Record<string, string>;
  onChange(next: CustomerForm): void;
  paymentMethod: 'CASH' | 'ONLINE';
  onPayment(value: 'CASH' | 'ONLINE'): void;
  file: File | null;
  onFile(file: File | null): void;
}) {
  return (
    <div>
      <h2 className="font-display text-3xl font-semibold text-[#17211d]">Últimos detalles</h2>
      <p className="mt-2 text-sm text-[#657069]">No necesitas crear una cuenta.</p>
      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <Input label="Nombre completo" autoComplete="name" value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} error={errors.name} />
        <Input label="Teléfono" type="tel" inputMode="tel" autoComplete="tel" value={value.phone} onChange={(event) => onChange({ ...value, phone: event.target.value })} error={errors.phone} />
        <div className="sm:col-span-2">
          <Input label="Correo (opcional)" type="email" inputMode="email" autoComplete="email" value={value.email} onChange={(event) => onChange({ ...value, email: event.target.value })} error={errors.email} hint="Lo usamos para enviarte la confirmación." />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="booking-notes" className="block text-sm font-semibold">Indicaciones (opcional)</label>
          <textarea id="booking-notes" rows={3} maxLength={1000} value={value.notes} onChange={(event) => onChange({ ...value, notes: event.target.value })} placeholder="Cuéntanos qué estilo buscas" className="mt-1.5 w-full resize-none rounded-xl border border-[#17211d]/15 bg-white px-4 py-3 text-base outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand)]/10" />
        </div>
      </div>

      <fieldset className="mt-7">
        <legend className="text-sm font-semibold">¿Cómo prefieres pagar?</legend>
        <div className="mt-2 grid grid-cols-2 gap-3">
          {([['CASH', 'En el local', 'Efectivo o terminal'], ['ONLINE', 'En línea', 'Pago seguro']] as const).map(([method, title, detail]) => (
            <button type="button" key={method} aria-pressed={paymentMethod === method} onClick={() => onPayment(method)} className={`rounded-2xl border p-4 text-left transition ${paymentMethod === method ? 'border-[var(--brand)] bg-[#fffaf1]' : 'border-[#17211d]/10 bg-white'}`}>
              <span className="block text-sm font-bold">{title}</span><span className="mt-1 block text-xs text-[#657069]">{detail}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-7">
        <p className="text-sm font-semibold">Foto de referencia (opcional)</p>
        {file ? (
          <div className="mt-2 flex items-center justify-between rounded-xl border border-[#17211d]/10 bg-white p-3">
            <span className="min-w-0 truncate text-sm">{file.name}</span>
            <button type="button" onClick={() => onFile(null)} aria-label="Quitar imagen" className="rounded-full p-2 hover:bg-black/5"><X className="h-4 w-4" /></button>
          </div>
        ) : (
          <label className="mt-2 flex min-h-24 cursor-pointer items-center justify-center gap-3 rounded-2xl border border-dashed border-[#17211d]/25 bg-white/50 text-sm font-semibold hover:bg-white">
            <ImagePlus className="h-5 w-5 text-[var(--brand)]" /> Adjuntar JPG, PNG o WebP
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => onFile(event.target.files?.[0] ?? null)} />
          </label>
        )}
        {errors.file && <p className="mt-1 text-sm text-red-700">{errors.file}</p>}
      </div>

      <label className="mt-7 flex cursor-pointer items-start gap-3 rounded-2xl bg-[#17211d]/5 p-4">
        <input type="checkbox" checked={value.consent} onChange={(event) => onChange({ ...value, consent: event.target.checked })} className="mt-1 h-5 w-5 rounded accent-[var(--brand)]" />
        <span className="text-sm leading-5 text-[#4e5953]">Acepto que mis datos se usen para gestionar esta cita y recibir información relacionada con ella.</span>
      </label>
      {errors.consent && <p className="mt-1 text-sm text-red-700">{errors.consent}</p>}
      <p className="mt-4 flex items-center gap-2 text-xs text-[#657069]"><ShieldCheck className="h-4 w-4" /> Tus datos no aparecen en enlaces públicos ni se comparten con otras barberías.</p>
    </div>
  );
}
