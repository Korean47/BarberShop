import { useEffect, useState } from 'react';
import { CalendarOff, Coffee, Mail, Pencil, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminPageHeader } from '../components/admin/AdminPageHeader';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { PageSpinner } from '../components/ui/Spinner';
import { createAdminBarber, getAdminCatalog, updateAdminBarber } from '../services/api';
import type { AdminCatalogData } from '../types';

type BarberDraft = AdminCatalogData['barbers'][number];

export function AdminBarbers() {
  const [catalog, setCatalog] = useState<AdminCatalogData | null>(null);
  const [draft, setDraft] = useState<BarberDraft | null>(null);
  const [saving, setSaving] = useState(false);
  const load = () => getAdminCatalog().then(setCatalog).catch((error) => toast.error(error instanceof Error ? error.message : 'No pudimos cargar el equipo'));
  useEffect(() => { void load(); }, []);

  function add() {
    if (!catalog) return;
    const schedules = Array.from({ length: 7 }, (_, dayOfWeek) => {
      const business = catalog.defaultLocation.businessSchedules.find((item) => item.dayOfWeek === dayOfWeek);
      return { dayOfWeek, startMinute: business?.startMinute ?? 540, endMinute: business?.endMinute ?? 1020, isWorking: business?.isOpen ?? false, breaks: [] };
    });
    setDraft({ id: '', displayName: '', email: '', phone: '', photoUrl: '', bio: '', isActive: true, serviceIds: [], schedules, timeOff: [] });
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    const payload = { ...draft, email: draft.email || null, phone: draft.phone || null, photoUrl: draft.photoUrl || null, bio: draft.bio || null };
    try {
      if (draft.id) await updateAdminBarber(draft.id, payload);
      else await createAdminBarber(payload);
      setDraft(null);
      await load();
      toast.success('Perfil y disponibilidad guardados');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos guardar el barbero');
    } finally { setSaving(false); }
  }

  function edit(barber: BarberDraft) {
    if (!catalog) return;
    const schedules = Array.from({ length: 7 }, (_, dayOfWeek) => {
      const existing = barber.schedules.find((item) => item.dayOfWeek === dayOfWeek);
      if (existing) return { ...existing, breaks: existing.breaks.map((entry) => ({ ...entry })) };
      const business = catalog.defaultLocation.businessSchedules.find((item) => item.dayOfWeek === dayOfWeek);
      return { dayOfWeek, startMinute: business?.startMinute ?? 540, endMinute: business?.endMinute ?? 1020, isWorking: false, breaks: [] };
    });
    setDraft({ ...barber, serviceIds: [...barber.serviceIds], schedules, timeOff: barber.timeOff.map((item) => ({ ...item })) });
  }

  function addBreak(scheduleIndex: number) {
    if (!draft) return;
    const schedules = [...draft.schedules];
    const schedule = schedules[scheduleIndex];
    const startMinute = Math.max(schedule.startMinute, Math.min(780, schedule.endMinute - 60));
    schedules[scheduleIndex] = { ...schedule, breaks: [...schedule.breaks, { startMinute, endMinute: Math.min(startMinute + 60, schedule.endMinute), label: 'Descanso' }] };
    setDraft({ ...draft, schedules });
  }

  function addTimeOff() {
    if (!draft) return;
    const startsAt = new Date();
    startsAt.setDate(startsAt.getDate() + 1);
    startsAt.setHours(9, 0, 0, 0);
    const endsAt = new Date(startsAt);
    endsAt.setHours(18, 0, 0, 0);
    setDraft({ ...draft, timeOff: [...draft.timeOff, { startsAt: startsAt.toISOString(), endsAt: endsAt.toISOString(), reason: 'Ausencia' }] });
  }

  if (!catalog) return <PageSpinner />;
  const field = 'admin-input mt-1.5';
  const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  return (
    <div className="space-y-7">
      <AdminPageHeader eyebrow="Equipo publicado" title="Barberos" description={`Perfiles, servicios, turnos, descansos y ausencias de ${catalog.defaultLocation.name}.`} action={<Button onClick={add}><Plus className="h-4 w-4" /> Agregar barbero</Button>} />
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {catalog.barbers.map((barber) => <article key={barber.id} className="admin-card overflow-hidden"><img src={barber.photoUrl || '/images/barber-1.webp'} alt={`Retrato de ${barber.displayName}`} className="aspect-square w-full object-cover" /><div className="p-4"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><h2 className="truncate font-bold">{barber.displayName}</h2>{barber.email && <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500"><Mail className="h-3 w-3" />{barber.email}</p>}</div><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${barber.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{barber.isActive ? 'Activo' : 'Oculto'}</span></div><p className="mt-4 line-clamp-3 min-h-[60px] text-sm leading-5 text-slate-600">{barber.bio || 'Sin descripción.'}</p><div className="mt-4 flex flex-wrap gap-1.5">{barber.serviceIds.slice(0, 3).map((id) => <span key={id} className="rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-600">{catalog.services.find((service) => service.id === id)?.name}</span>)}</div><div className="mt-4 flex items-center gap-2 text-xs text-slate-500"><CalendarOff className="h-4 w-4" /> {barber.timeOff.length ? `${barber.timeOff.length} ausencia(s) programada(s)` : 'Sin ausencias próximas'}</div><Button variant="outline" className="mt-4 w-full" onClick={() => edit(barber)}><Pencil className="h-4 w-4" /> Editar perfil y agenda</Button></div></article>)}
      </section>

      <Modal isOpen={Boolean(draft)} onClose={() => setDraft(null)} title={draft?.id ? 'Editar barbero' : 'Nuevo barbero'} size="lg">
        {draft && <div className="space-y-7">
          <div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold sm:col-span-2">Nombre<input className={field} value={draft.displayName} onChange={(event) => setDraft({ ...draft, displayName: event.target.value })} /></label><label className="text-sm font-semibold">Correo<input type="email" className={field} value={draft.email || ''} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></label><label className="text-sm font-semibold">Teléfono<input className={field} value={draft.phone || ''} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></label><label className="text-sm font-semibold sm:col-span-2">URL de fotografía<input className={field} value={draft.photoUrl || ''} onChange={(event) => setDraft({ ...draft, photoUrl: event.target.value })} /></label><label className="text-sm font-semibold sm:col-span-2">Descripción<textarea className={`${field} min-h-24`} value={draft.bio || ''} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} /></label><label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" className="h-5 w-5" checked={draft.isActive} onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })} /> Publicado</label></div>

          <fieldset><legend className="text-sm font-semibold">Servicios que realiza</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{catalog.services.map((service) => <label key={service.id} className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 px-3 text-sm"><input type="checkbox" checked={draft.serviceIds.includes(service.id)} onChange={(event) => setDraft({ ...draft, serviceIds: event.target.checked ? [...draft.serviceIds, service.id] : draft.serviceIds.filter((id) => id !== service.id) })} />{service.name}</label>)}</div></fieldset>

          <fieldset><legend className="text-sm font-semibold">Turnos y descansos</legend><p className="mt-1 text-xs text-slate-500">La disponibilidad se cruza con el horario de la sucursal, estas jornadas y las citas existentes.</p><div className="mt-3 space-y-3">{draft.schedules.map((schedule, scheduleIndex) => <div key={schedule.dayOfWeek} className="rounded-xl border border-slate-200 p-3"><div className="grid items-center gap-3 sm:grid-cols-[120px_1fr_1fr_auto]"><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={schedule.isWorking} onChange={(event) => { const schedules = [...draft.schedules]; schedules[scheduleIndex] = { ...schedule, isWorking: event.target.checked }; setDraft({ ...draft, schedules }); }} />{days[schedule.dayOfWeek]}</label><input type="time" aria-label={`Inicio ${days[schedule.dayOfWeek]}`} className="admin-input" disabled={!schedule.isWorking} value={minutesToTime(schedule.startMinute)} onChange={(event) => { const schedules = [...draft.schedules]; schedules[scheduleIndex] = { ...schedule, startMinute: timeToMinutes(event.target.value) }; setDraft({ ...draft, schedules }); }} /><input type="time" aria-label={`Fin ${days[schedule.dayOfWeek]}`} className="admin-input" disabled={!schedule.isWorking} value={minutesToTime(schedule.endMinute)} onChange={(event) => { const schedules = [...draft.schedules]; schedules[scheduleIndex] = { ...schedule, endMinute: timeToMinutes(event.target.value) }; setDraft({ ...draft, schedules }); }} /><button type="button" className="round-control" disabled={!schedule.isWorking} onClick={() => addBreak(scheduleIndex)} aria-label={`Agregar descanso el ${days[schedule.dayOfWeek]}`}><Coffee className="h-4 w-4" /></button></div>{schedule.breaks.map((item, breakIndex) => <div key={`${item.startMinute}-${breakIndex}`} className="mt-2 grid gap-2 border-t border-slate-100 pt-2 sm:grid-cols-[1fr_110px_110px_auto]"><input className="admin-input" value={item.label || ''} aria-label="Nombre del descanso" onChange={(event) => { const schedules = [...draft.schedules]; const breaks = [...schedule.breaks]; breaks[breakIndex] = { ...item, label: event.target.value }; schedules[scheduleIndex] = { ...schedule, breaks }; setDraft({ ...draft, schedules }); }} /><input type="time" className="admin-input" aria-label="Inicio del descanso" value={minutesToTime(item.startMinute)} onChange={(event) => { const schedules = [...draft.schedules]; const breaks = [...schedule.breaks]; breaks[breakIndex] = { ...item, startMinute: timeToMinutes(event.target.value) }; schedules[scheduleIndex] = { ...schedule, breaks }; setDraft({ ...draft, schedules }); }} /><input type="time" className="admin-input" aria-label="Fin del descanso" value={minutesToTime(item.endMinute)} onChange={(event) => { const schedules = [...draft.schedules]; const breaks = [...schedule.breaks]; breaks[breakIndex] = { ...item, endMinute: timeToMinutes(event.target.value) }; schedules[scheduleIndex] = { ...schedule, breaks }; setDraft({ ...draft, schedules }); }} /><button type="button" className="round-control text-red-700" aria-label="Eliminar descanso" onClick={() => { const schedules = [...draft.schedules]; schedules[scheduleIndex] = { ...schedule, breaks: schedule.breaks.filter((_, index) => index !== breakIndex) }; setDraft({ ...draft, schedules }); }}><Trash2 className="h-4 w-4" /></button></div>)}</div>)}</div></fieldset>

          <fieldset><legend className="sr-only">Ausencias y bloqueos personales</legend><div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-semibold">Ausencias y bloqueos personales</h3><p className="mt-1 text-xs text-slate-500">Vacaciones, permisos o citas personales eliminan esos horarios de la agenda.</p></div><Button type="button" variant="outline" onClick={addTimeOff}><Plus className="h-4 w-4" /> Agregar ausencia</Button></div><div className="mt-3 space-y-3">{draft.timeOff.map((item, index) => <div key={item.id || `${item.startsAt}-${index}`} className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"><label className="text-xs text-slate-500">Desde<input type="datetime-local" className={field} value={toLocalInput(item.startsAt)} onChange={(event) => { if (!event.target.value) return; const timeOff = [...draft.timeOff]; timeOff[index] = { ...item, startsAt: new Date(event.target.value).toISOString() }; setDraft({ ...draft, timeOff }); }} /></label><label className="text-xs text-slate-500">Hasta<input type="datetime-local" className={field} value={toLocalInput(item.endsAt)} onChange={(event) => { if (!event.target.value) return; const timeOff = [...draft.timeOff]; timeOff[index] = { ...item, endsAt: new Date(event.target.value).toISOString() }; setDraft({ ...draft, timeOff }); }} /></label><label className="text-xs text-slate-500">Motivo<input className={field} value={item.reason || ''} onChange={(event) => { const timeOff = [...draft.timeOff]; timeOff[index] = { ...item, reason: event.target.value }; setDraft({ ...draft, timeOff }); }} /></label><button type="button" className="round-control self-end text-red-700" aria-label="Eliminar ausencia" onClick={() => setDraft({ ...draft, timeOff: draft.timeOff.filter((_, itemIndex) => itemIndex !== index) })}><Trash2 className="h-4 w-4" /></button></div>)}{draft.timeOff.length === 0 && <p className="rounded-xl bg-slate-50 p-4 text-sm text-slate-500">No hay ausencias futuras.</p>}</div></fieldset>

          <div className="flex justify-end gap-3 border-t border-slate-200 pt-5"><Button variant="ghost" onClick={() => setDraft(null)}>Cancelar</Button><Button onClick={() => void save()} loading={saving}>Guardar perfil y agenda</Button></div>
        </div>}
      </Modal>
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

function toLocalInput(value: string) {
  const date = new Date(value);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}
