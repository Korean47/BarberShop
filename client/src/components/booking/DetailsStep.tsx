import { useEffect, useMemo } from 'react';
import { Camera, ImagePlus, ShieldCheck, X } from 'lucide-react';
import { Input } from '../ui/Input';

export interface CustomerForm { name: string; phone: string; email: string; notes: string; consent: boolean; }

export function DetailsStep({ value, errors, onChange, file, onFile, showReferenceUpload }: {
  value: CustomerForm;
  errors: Record<string, string>;
  onChange(next: CustomerForm): void;
  file: File | null;
  onFile(file: File | null): void;
  showReferenceUpload: boolean;
}) {
  const preview = useMemo(() => file ? URL.createObjectURL(file) : '', [file]);
  useEffect(() => () => { if (preview) URL.revokeObjectURL(preview); }, [preview]);
  return (
    <div>
      <h2 className="booking-title">Datos del cliente</h2>
      <p className="booking-description">Usaremos esta información para identificar la cita y enviar la confirmación.</p>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <Input label="Nombre completo" autoComplete="name" value={value.name} onChange={(event) => onChange({ ...value, name: event.target.value })} error={errors.name} required />
        <Input label="Teléfono" type="tel" inputMode="tel" autoComplete="tel" value={value.phone} onChange={(event) => onChange({ ...value, phone: event.target.value })} error={errors.phone} required />
        <div className="sm:col-span-2"><Input label="Correo (opcional)" type="email" inputMode="email" autoComplete="email" value={value.email} onChange={(event) => onChange({ ...value, email: event.target.value })} error={errors.email} hint="Recibirás la confirmación y los cambios de la cita cuando el envío de correo esté configurado." /></div>
        <div className="sm:col-span-2"><label htmlFor="booking-notes" className="block text-sm font-semibold">Notas (opcional)</label><textarea id="booking-notes" rows={3} maxLength={1000} value={value.notes} onChange={(event) => onChange({ ...value, notes: event.target.value })} placeholder={showReferenceUpload ? 'Describe el corte o detalle que buscas' : 'Información útil para el servicio'} className="form-control mt-1.5 resize-none" /></div>
      </div>
      {showReferenceUpload && <div className="mt-5 rounded-2xl border border-[var(--stone)] bg-[var(--background)] p-4"><p className="font-semibold">Referencia para el corte personalizado</p><p className="mt-1 text-xs leading-5 text-[var(--muted)]">Puedes describirlo, tomar una fotografía o continuar sin imagen.</p>{file && preview ? <div className="relative mt-3 overflow-hidden rounded-xl bg-white"><img src={preview} alt="Vista previa de la referencia" className="aspect-video w-full object-cover" /><div className="absolute inset-x-2 bottom-2 flex items-center justify-between rounded-lg bg-white/95 p-2 shadow"><span className="min-w-0 truncate text-xs font-semibold">{file.name}</span><button type="button" onClick={() => onFile(null)} aria-label="Eliminar imagen" className="round-control h-11 w-11"><X className="h-4 w-4" /></button></div></div> : <label className="mt-3 flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[var(--stone)] bg-white px-3 text-center hover:border-[var(--primary)]"><span className="flex items-center gap-2 font-semibold text-[var(--primary)]"><Camera className="h-5 w-5" /><ImagePlus className="h-5 w-5" /> Tomar o subir imagen</span><span className="text-xs text-[var(--muted)]">JPG, PNG o WebP</span><input type="file" accept="image/jpeg,image/png,image/webp" capture="environment" className="sr-only" onChange={(event) => onFile(event.target.files?.[0] ?? null)} /></label>}{errors.file && <p className="mt-2 text-sm font-semibold text-[var(--error)]">{errors.file}</p>}</div>}
      <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-xl bg-[#E9F1F2] p-4"><input type="checkbox" checked={value.consent} onChange={(event) => onChange({ ...value, consent: event.target.checked })} className="mt-0.5 h-5 w-5 shrink-0 rounded accent-[var(--primary)]" /><span className="text-sm leading-5">Acepto que mis datos se utilicen para gestionar esta cita y sus avisos.</span></label>
      {errors.consent && <p className="mt-1 text-sm font-semibold text-[var(--error)]">{errors.consent}</p>}
      <p className="mt-4 flex items-start gap-2 text-xs leading-5 text-[var(--muted)]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[var(--primary)]" /> La consulta posterior requiere el código de la cita y el teléfono asociado.</p>
    </div>
  );
}
