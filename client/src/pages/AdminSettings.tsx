import { useEffect, useMemo, useState } from 'react';
import { Building2, CalendarClock, CreditCard, Eye, Image, Plus, Save, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminPageHeader } from '../components/admin/AdminPageHeader';
import { Button } from '../components/ui/Button';
import { PageSpinner } from '../components/ui/Spinner';
import { getAdminSettings, updateAdminSettings } from '../services/api';
import type { AdminSettingsData } from '../types';

const tabs = [
  { id: 'landing', label: 'Landing', icon: Image },
  { id: 'business', label: 'Negocio', icon: Building2 },
  { id: 'schedule', label: 'Agenda', icon: CalendarClock },
  { id: 'payments', label: 'Pagos', icon: CreditCard },
] as const;

type TabId = typeof tabs[number]['id'];

interface SettingsForm {
  business: { name: string; contactEmail: string; contactPhone: string; timezone: string; currency: 'MXN' };
  location: {
    id: string; name: string; addressLine1: string; addressLine2: string; city: string; state: string; postalCode: string; phone: string; mapsUrl: string;
    schedules: AdminSettingsData['locations'][number]['businessSchedules'];
    exceptions: Array<{ date: string; isOpen: boolean; startMinute: number | null; endMinute: number | null; label: string }>;
  };
  branding: {
    logoUrl: string; heroImageUrl: string; heroVideoUrl: string; heroMobileVideoUrl: string; heroPosterUrl: string;
    heroFallbackUrls: string; heroTitle: string; heroSubtitle: string; shopImageUrl: string; mapUrl: string;
    whatsappUrl: string; instagramUrl: string; primaryColor: string; secondaryColor: string; accentColor: string;
    backgroundColor: string; fontFamily: 'Inter' | 'DM Sans' | 'Source Sans 3' | 'system-ui'; publish: boolean;
  };
  booking: { minimumNoticeMinutes: number; maxAdvanceDays: number; changeCutoffHours: number; slotIntervalMinutes: number; holdMinutes: number };
  payments: { allowCash: boolean; allowOnline: boolean };
}

function makeForm(data: AdminSettingsData): SettingsForm {
  const settings = Object.fromEntries(data.settings.map(({ key, value }) => [key, value]));
  const location = data.locations[0];
  const branding = data.branding;
  return {
    business: { name: data.name, contactEmail: data.contactEmail || '', contactPhone: data.contactPhone || '', timezone: data.timezone, currency: 'MXN' },
    location: {
      id: location.id, name: location.name, addressLine1: location.addressLine1, addressLine2: location.addressLine2 || '', city: location.city,
      state: location.state, postalCode: location.postalCode || '', phone: location.phone || '', mapsUrl: location.mapsUrl || '',
      schedules: Array.from({ length: 7 }, (_, dayOfWeek) => location.businessSchedules.find((item) => item.dayOfWeek === dayOfWeek) || { dayOfWeek, startMinute: 540, endMinute: 1020, isOpen: false }),
      exceptions: location.scheduleExceptions.map((item) => ({ date: item.date.slice(0, 10), isOpen: item.isOpen, startMinute: item.startMinute, endMinute: item.endMinute, label: item.label || '' })),
    },
    branding: {
      logoUrl: branding?.logoUrl || '', heroImageUrl: branding?.heroImageUrl || '', heroVideoUrl: branding?.heroVideoUrl || '', heroMobileVideoUrl: branding?.heroMobileVideoUrl || '',
      heroPosterUrl: branding?.heroPosterUrl || '', heroFallbackUrls: (() => { try { return (JSON.parse(branding?.heroFallbackUrls || '[]') as string[]).join('\n'); } catch { return ''; } })(),
      heroTitle: branding?.heroTitle || 'Cortes y barba, con tiempo para hacerlo bien.', heroSubtitle: branding?.heroSubtitle || 'Elige servicio, barbero y horario. Tu cita queda lista en pocos pasos.',
      shopImageUrl: branding?.shopImageUrl || '', mapUrl: branding?.mapUrl || '', whatsappUrl: branding?.whatsappUrl || '', instagramUrl: branding?.instagramUrl || '',
      primaryColor: branding?.primaryColor || '#183A44', secondaryColor: branding?.secondaryColor || '#17191C', accentColor: branding?.accentColor || '#B8543C',
      backgroundColor: branding?.backgroundColor || '#F5F2EB', fontFamily: (branding?.fontFamily as SettingsForm['branding']['fontFamily']) || 'DM Sans', publish: true,
    },
    booking: {
      minimumNoticeMinutes: Number(settings['booking.minimumNoticeMinutes'] || 120), maxAdvanceDays: Number(settings['booking.maxAdvanceDays'] || 90),
      changeCutoffHours: Number(settings['booking.cancellationHours'] || 2), slotIntervalMinutes: Number(settings['booking.slotIntervalMinutes'] || 15), holdMinutes: Number(settings['booking.holdMinutes'] || 30),
    },
    payments: { allowCash: settings['booking.allowCash'] !== 'false', allowOnline: settings['booking.allowOnline'] === 'true' },
  };
}

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState<TabId>('landing');
  const [data, setData] = useState<AdminSettingsData | null>(null);
  const [form, setForm] = useState<SettingsForm | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { getAdminSettings().then((value) => { setData(value); setForm(makeForm(value)); }).catch((error) => toast.error(error instanceof Error ? error.message : 'No pudimos cargar la configuración')); }, []);
  const fallbackImages = useMemo(() => form?.branding.heroFallbackUrls.split('\n').map((item) => item.trim()).filter(Boolean) || [], [form?.branding.heroFallbackUrls]);

  async function save() {
    if (!form) return;
    setSaving(true);
    try {
      const updated = await updateAdminSettings({ ...form, branding: { ...form.branding, heroFallbackUrls: fallbackImages } });
      setData(updated);
      setForm(makeForm(updated));
      toast.success('Configuración publicada');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos guardar la configuración');
    } finally { setSaving(false); }
  }

  function addException() {
    if (!form) return;
    const used = new Set(form.location.exceptions.map(({ date }) => date));
    const next = new Date();
    next.setHours(12, 0, 0, 0);
    do { next.setDate(next.getDate() + 1); } while (used.has(next.toISOString().slice(0, 10)));
    setForm({ ...form, location: { ...form.location, exceptions: [...form.location.exceptions, { date: next.toISOString().slice(0, 10), isOpen: false, startMinute: null, endMinute: null, label: 'Cerrado' }] } });
  }

  if (!data || !form) return <PageSpinner />;
  const field = 'admin-input mt-1.5';

  return (
    <div className="space-y-7">
      <AdminPageHeader eyebrow="Contenido y operación" title="Configuración" description="Los cambios publicados aquí se reflejan en el sitio de clientes y en las reglas del backend." action={<Button onClick={() => void save()} loading={saving}><Save className="h-4 w-4" /> Guardar y publicar</Button>} />
      <section className="grid gap-6 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="admin-card h-fit p-2">{tabs.map((tab) => { const Icon = tab.icon; return <button key={tab.id} type="button" onClick={() => setActiveTab(tab.id)} className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-semibold ${activeTab === tab.id ? 'bg-[#E9F1F2] text-[#183A44]' : 'text-slate-600 hover:bg-slate-50'}`}><Icon className="h-4 w-4" />{tab.label}</button>; })}</aside>
        <article className="admin-card min-w-0 p-5 lg:p-7">
          {activeTab === 'landing' && <div className="space-y-7"><div><h2 className="text-lg font-bold">Portada e identidad</h2><p className="mt-1 text-sm text-slate-500">Si no hay video, la portada utiliza las imágenes de respaldo en orden.</p></div><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold sm:col-span-2">Título principal<input className={field} value={form.branding.heroTitle} onChange={(event) => setForm({ ...form, branding: { ...form.branding, heroTitle: event.target.value } })} /></label><label className="text-sm font-semibold sm:col-span-2">Texto secundario<textarea className={`${field} min-h-24`} value={form.branding.heroSubtitle} onChange={(event) => setForm({ ...form, branding: { ...form.branding, heroSubtitle: event.target.value } })} /></label><label className="text-sm font-semibold">Video de escritorio<input className={field} value={form.branding.heroVideoUrl} onChange={(event) => setForm({ ...form, branding: { ...form.branding, heroVideoUrl: event.target.value } })} placeholder="https://… o /media/…" /></label><label className="text-sm font-semibold">Video móvil<input className={field} value={form.branding.heroMobileVideoUrl} onChange={(event) => setForm({ ...form, branding: { ...form.branding, heroMobileVideoUrl: event.target.value } })} /></label><label className="text-sm font-semibold">Imagen principal<input className={field} value={form.branding.heroImageUrl} onChange={(event) => setForm({ ...form, branding: { ...form.branding, heroImageUrl: event.target.value } })} /></label><label className="text-sm font-semibold">Poster del video<input className={field} value={form.branding.heroPosterUrl} onChange={(event) => setForm({ ...form, branding: { ...form.branding, heroPosterUrl: event.target.value } })} /></label><label className="text-sm font-semibold sm:col-span-2">Imágenes de respaldo, una por línea<textarea className={`${field} min-h-28 font-mono text-xs`} value={form.branding.heroFallbackUrls} onChange={(event) => setForm({ ...form, branding: { ...form.branding, heroFallbackUrls: event.target.value } })} /></label><label className="text-sm font-semibold">Foto del local<input className={field} value={form.branding.shopImageUrl} onChange={(event) => setForm({ ...form, branding: { ...form.branding, shopImageUrl: event.target.value } })} /></label><label className="text-sm font-semibold">URL de WhatsApp<input className={field} value={form.branding.whatsappUrl} onChange={(event) => setForm({ ...form, branding: { ...form.branding, whatsappUrl: event.target.value } })} /></label></div><div className="grid grid-cols-2 gap-4 sm:grid-cols-4">{(['primaryColor', 'secondaryColor', 'accentColor', 'backgroundColor'] as const).map((key) => <label key={key} className="text-xs font-semibold capitalize">{key.replace('Color', '')}<input type="color" className="mt-2 h-12 w-full rounded-lg border border-slate-300" value={form.branding[key]} onChange={(event) => setForm({ ...form, branding: { ...form.branding, [key]: event.target.value } })} /></label>)}</div><div className="overflow-hidden rounded-2xl border border-slate-200"><div className="flex items-center gap-2 border-b border-slate-200 px-4 py-3 text-sm font-semibold"><Eye className="h-4 w-4" /> Vista previa</div><div className="relative min-h-72 bg-slate-900 p-6 text-white" style={{ backgroundImage: `linear-gradient(90deg,rgba(10,15,17,.88),rgba(10,15,17,.35)),url(${form.branding.heroImageUrl || fallbackImages[0] || '/images/hero-local.webp'})`, backgroundSize: 'cover', backgroundPosition: 'center' }}><div className="max-w-lg"><p className="text-sm text-white/70">{form.business.name}</p><p className="mt-5 text-4xl font-semibold leading-tight">{form.branding.heroTitle}</p><p className="mt-3 text-sm leading-6 text-white/75">{form.branding.heroSubtitle}</p></div></div></div></div>}

          {activeTab === 'business' && <div className="space-y-6"><div><h2 className="text-lg font-bold">Información del negocio</h2><p className="mt-1 text-sm text-slate-500">Fuente única para la landing, confirmaciones y contacto.</p></div><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold">Nombre<input className={field} value={form.business.name} onChange={(event) => setForm({ ...form, business: { ...form.business, name: event.target.value } })} /></label><label className="text-sm font-semibold">Teléfono<input className={field} value={form.business.contactPhone} onChange={(event) => setForm({ ...form, business: { ...form.business, contactPhone: event.target.value } })} /></label><label className="text-sm font-semibold">Correo<input className={field} value={form.business.contactEmail} onChange={(event) => setForm({ ...form, business: { ...form.business, contactEmail: event.target.value } })} /></label><label className="text-sm font-semibold">Zona horaria<select className={field} value={form.business.timezone} onChange={(event) => setForm({ ...form, business: { ...form.business, timezone: event.target.value } })}><option>America/Hermosillo</option><option>America/Mexico_City</option><option>America/Tijuana</option><option>America/Chihuahua</option></select></label><label className="text-sm font-semibold">Sucursal<input className={field} value={form.location.name} onChange={(event) => setForm({ ...form, location: { ...form.location, name: event.target.value } })} /></label><label className="text-sm font-semibold">Dirección<input className={field} value={form.location.addressLine1} onChange={(event) => setForm({ ...form, location: { ...form.location, addressLine1: event.target.value } })} /></label><label className="text-sm font-semibold">Ciudad<input className={field} value={form.location.city} onChange={(event) => setForm({ ...form, location: { ...form.location, city: event.target.value } })} /></label><label className="text-sm font-semibold">Estado<input className={field} value={form.location.state} onChange={(event) => setForm({ ...form, location: { ...form.location, state: event.target.value } })} /></label><label className="text-sm font-semibold sm:col-span-2">Enlace real de Google Maps<input className={field} value={form.location.mapsUrl} onChange={(event) => setForm({ ...form, location: { ...form.location, mapsUrl: event.target.value } })} /></label></div></div>}

          {activeTab === 'schedule' && <div className="space-y-7">
            <div><h2 className="text-lg font-bold">Reglas de agenda</h2><p className="mt-1 text-sm text-slate-500">Las reglas, horarios y cierres se validan en el backend y cambian la disponibilidad pública.</p></div>
            <div className="grid gap-5 sm:grid-cols-2">{([['minimumNoticeMinutes', 'Anticipación mínima (min)'], ['maxAdvanceDays', 'Ventana máxima (días)'], ['changeCutoffHours', 'Margen para cambios (horas)'], ['slotIntervalMinutes', 'Intervalo de horarios (min)'], ['holdMinutes', 'Retención de pago (min)']] as const).map(([key, label]) => <label key={key} className="text-sm font-semibold">{label}<input type="number" min="0" className={field} value={form.booking[key]} onChange={(event) => setForm({ ...form, booking: { ...form.booking, [key]: Number(event.target.value) } })} /></label>)}</div>
            <div><h3 className="font-semibold">Horario semanal de la sucursal</h3><div className="mt-3 space-y-2">{form.location.schedules.map((schedule, index) => <div key={schedule.dayOfWeek} className="grid items-center gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[130px_1fr_1fr]">
              <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={schedule.isOpen} onChange={(event) => { const schedules = [...form.location.schedules]; schedules[index] = { ...schedule, isOpen: event.target.checked }; setForm({ ...form, location: { ...form.location, schedules } }); }} />{['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'][schedule.dayOfWeek]}</label>
              <label className="text-xs text-slate-500">Abre<input type="time" className={field} disabled={!schedule.isOpen} value={minutesToTime(schedule.startMinute)} onChange={(event) => { const schedules = [...form.location.schedules]; schedules[index] = { ...schedule, startMinute: timeToMinutes(event.target.value) }; setForm({ ...form, location: { ...form.location, schedules } }); }} /></label>
              <label className="text-xs text-slate-500">Cierra<input type="time" className={field} disabled={!schedule.isOpen} value={minutesToTime(schedule.endMinute)} onChange={(event) => { const schedules = [...form.location.schedules]; schedules[index] = { ...schedule, endMinute: timeToMinutes(event.target.value) }; setForm({ ...form, location: { ...form.location, schedules } }); }} /></label>
            </div>)}</div></div>
            <div><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="font-semibold">Días cerrados y horarios especiales</h3><p className="mt-1 text-xs text-slate-500">Un día especial reemplaza el horario semanal para esa fecha.</p></div><Button type="button" variant="outline" onClick={addException}><Plus className="h-4 w-4" /> Agregar fecha</Button></div><div className="mt-3 space-y-3">{form.location.exceptions.map((exception, index) => <div key={`${exception.date}-${index}`} className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]">
              <label className="text-xs text-slate-500">Fecha<input type="date" className={field} value={exception.date} onChange={(event) => { const exceptions = [...form.location.exceptions]; exceptions[index] = { ...exception, date: event.target.value }; setForm({ ...form, location: { ...form.location, exceptions } }); }} /></label>
              <label className="text-xs text-slate-500">Motivo<input className={field} value={exception.label} onChange={(event) => { const exceptions = [...form.location.exceptions]; exceptions[index] = { ...exception, label: event.target.value }; setForm({ ...form, location: { ...form.location, exceptions } }); }} placeholder="Festivo, evento…" /></label>
              <div className="grid grid-cols-2 gap-2"><label className="col-span-2 flex items-center gap-2 text-xs font-semibold"><input type="checkbox" checked={exception.isOpen} onChange={(event) => { const exceptions = [...form.location.exceptions]; exceptions[index] = { ...exception, isOpen: event.target.checked, startMinute: event.target.checked ? exception.startMinute ?? 600 : null, endMinute: event.target.checked ? exception.endMinute ?? 840 : null }; setForm({ ...form, location: { ...form.location, exceptions } }); }} /> Abierto con horario especial</label>{exception.isOpen && <><input type="time" aria-label="Apertura especial" className="admin-input" value={minutesToTime(exception.startMinute ?? 600)} onChange={(event) => { const exceptions = [...form.location.exceptions]; exceptions[index] = { ...exception, startMinute: timeToMinutes(event.target.value) }; setForm({ ...form, location: { ...form.location, exceptions } }); }} /><input type="time" aria-label="Cierre especial" className="admin-input" value={minutesToTime(exception.endMinute ?? 840)} onChange={(event) => { const exceptions = [...form.location.exceptions]; exceptions[index] = { ...exception, endMinute: timeToMinutes(event.target.value) }; setForm({ ...form, location: { ...form.location, exceptions } }); }} /></>}</div>
              <button type="button" className="round-control self-end text-red-700" aria-label={`Eliminar fecha ${exception.date}`} onClick={() => setForm({ ...form, location: { ...form.location, exceptions: form.location.exceptions.filter((_, itemIndex) => itemIndex !== index) } })}><Trash2 className="h-4 w-4" /></button>
            </div>)}{form.location.exceptions.length === 0 && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No hay cierres ni horarios especiales configurados.</p>}</div></div>
          </div>}

          {activeTab === 'payments' && <div className="space-y-6"><div><h2 className="text-lg font-bold">Métodos de pago</h2><p className="mt-1 text-sm text-slate-500">El pago en línea solo se publica cuando el servidor tiene un proveedor configurado.</p></div><div className={`rounded-xl border p-4 ${data.paymentConfiguration.onlineConfigured ? 'border-emerald-200 bg-emerald-50' : 'border-amber-200 bg-amber-50'}`}><p className="font-semibold">Proveedor: {data.paymentConfiguration.provider}</p><p className="mt-1 text-sm">{data.paymentConfiguration.onlineConfigured ? `Configurado para ${data.paymentConfiguration.environment}.` : 'Faltan variables de entorno del proveedor. La opción permanece oculta para clientes.'}</p></div><label className="flex min-h-14 items-center justify-between rounded-xl border border-slate-200 p-4"><span><strong className="block text-sm">Pago en el local</strong><small className="text-slate-500">Permite confirmar la cita sin checkout.</small></span><input type="checkbox" className="h-5 w-5" checked={form.payments.allowCash} onChange={(event) => setForm({ ...form, payments: { ...form.payments, allowCash: event.target.checked } })} /></label><label className="flex min-h-14 items-center justify-between rounded-xl border border-slate-200 p-4"><span><strong className="block text-sm">Pago en línea</strong><small className="text-slate-500">Checkout alojado, webhook e idempotencia.</small></span><input type="checkbox" className="h-5 w-5" checked={form.payments.allowOnline} disabled={!data.paymentConfiguration.onlineConfigured} onChange={(event) => setForm({ ...form, payments: { ...form.payments, allowOnline: event.target.checked } })} /></label></div>}
        </article>
      </section>
    </div>
  );
}

function minutesToTime(value: number) {
  const safe = Math.min(value, 1439);
  return `${String(Math.floor(safe / 60)).padStart(2, '0')}:${String(safe % 60).padStart(2, '0')}`;
}

function timeToMinutes(value: string) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}
