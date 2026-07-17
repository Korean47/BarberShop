import { useEffect, useMemo } from 'react';
import { Camera, ImagePlus, ShieldCheck, X } from 'lucide-react';
import { Input } from '../ui/Input';

export interface CustomerForm { name: string; phone: string; email: string; notes: string; consent: boolean; }

export function DetailsStep({ value, errors, onChange, paymentMethod, onPayment, file, onFile, showReferenceUpload }: {
  value: CustomerForm;
  errors: Record<string, string>;
  onChange(next: CustomerForm): void;
  paymentMethod: 'CASH' | 'ONLINE';
  onPayment(value: 'CASH' | 'ONLINE'): void;
  file: File | null;
  onFile(file: File | null): void;
  showReferenceUpload: boolean;
}) {
  const preview = useMemo(() => file ? URL.createObjectURL(file) : '', [file]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);

  return (
    <div>
      <h2 className="text-2xl font-black tracking-tight text-[#17313a] sm:text-3xl">¿A nombre de quién?</h2>
      <p className="mt-2 text-sm text-[#587078]">Te avisamos sobre esta cita. No tienes que crear una cuenta.</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Input label="Nombre completo" autoComplete="name" value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} error={errors.name} />
        <Input label="Teléfono" type="tel" inputMode="tel" autoComplete="tel" value={value.phone} onChange={(event) => onChange({ ...value, phone: event.target.value })} error={errors.phone} />
        <div className="sm:col-span-2"><Input label="Correo (opcional)" type="email" inputMode="email" autoComplete="email" value={value.email} onChange={(event) => onChange({ ...value, email: event.target.value })} error={errors.email} hint="Para enviarte la confirmación y el enlace de tu cita." /></div>
        <div className="sm:col-span-2"><label htmlFor="booking-notes" className="block text-sm font-bold">¿Algo que debamos saber? (opcional)</label><textarea id="booking-notes" rows={3} maxLength={1000} value={value.notes} onChange={(event) => onChange({ ...value, notes: event.target.value })} placeholder={showReferenceUpload ? 'Describe el corte o detalle que buscas' : 'Ej. Tengo el cabello muy rizado'} className="mt-1.5 w-full resize-none rounded-xl border border-[#17313a]/20 bg-white px-4 py-3 text-base outline-none focus:border-[var(--brand)] focus:ring-4 focus:ring-[var(--brand)]/10" /></div>
      </div>

      {showReferenceUpload && (
        <div className="mt-6 rounded-2xl border border-[#17313a]/10 bg-[#fff8ee] p-4">
          <p className="font-black">Muéstranos tu idea</p><p className="mt-1 text-xs leading-5 text-[#587078]">Toma una foto o sube una referencia. La reducimos antes de enviarla para cuidar tus datos.</p>
          {file && preview ? (
            <div className="relative mt-3 overflow-hidden rounded-xl bg-white"><img src={preview} alt="Vista previa de tu corte de referencia" className="aspect-video w-full object-cover" /><div className="absolute inset-x-2 bottom-2 flex items-center justify-between rounded-lg bg-white/95 p-2 shadow"><span className="min-w-0 truncate text-xs font-bold">{file.name}</span><button type="button" onClick={() => onFile(null)} aria-label="Quitar foto" className="grid h-9 w-9 shrink-0 place-items-center rounded-lg hover:bg-slate-100"><X className="h-4 w-4" /></button></div></div>
          ) : (
            <label className="mt-3 flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[var(--brand)]/30 bg-white px-3 text-center hover:border-[var(--brand)]">
              <span className="flex items-center gap-2 font-black text-[var(--brand)]"><Camera className="h-5 w-5" /><ImagePlus className="h-5 w-5" /> Tomar o subir foto</span><span className="text-xs text-[#587078]">JPG, PNG o WebP</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="sr-only" onChange={(event) => onFile(event.target.files?.[0] ?? null)} />
            </label>
          )}
          {errors.file && <p className="mt-2 text-sm font-semibold text-red-700">{errors.file}</p>}
        </div>
      )}

      <fieldset className="mt-6"><legend className="text-sm font-bold">¿Cómo pagas?</legend><div className="mt-2 grid grid-cols-2 gap-2">{([['CASH', 'En el local', 'Efectivo o terminal'], ['ONLINE', 'En línea', 'Pago seguro']] as const).map(([method, title, detail]) => <button type="button" key={method} aria-pressed={paymentMethod === method} onClick={() => onPayment(method)} className={`min-h-[72px] rounded-xl border-2 p-3 text-left transition ${paymentMethod === method ? 'border-[var(--accent)] bg-[#fff8ee]' : 'border-[#17313a]/10 bg-white'}`}><span className="block text-sm font-black">{title}</span><span className="mt-1 block text-xs text-[#587078]">{detail}</span></button>)}</div></fieldset>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-xl bg-[#eaf4f5] p-4"><input type="checkbox" checked={value.consent} onChange={(event) => onChange({ ...value, consent: event.target.checked })} className="mt-0.5 h-5 w-5 shrink-0 rounded accent-[var(--brand)]" /><span className="text-sm leading-5 text-[#38545d]">Acepto que usen mis datos solo para gestionar esta cita y avisarme sobre ella.</span></label>
      {errors.consent && <p className="mt-1 text-sm font-semibold text-red-700">{errors.consent}</p>}
      <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[#587078]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--brand)]" /> Tu enlace de administración es privado. No compartimos tus datos con otras barberías.</p>
    </div>
  );
}
