import { useEffect, useState } from 'react';
import { Mail, Pencil, Plus } from 'lucide-react';
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

  function add() { setDraft({ id: '', displayName: '', email: '', phone: '', photoUrl: '', bio: '', isActive: true, serviceIds: [] }); }
  async function save() {
    if (!draft) return;
    setSaving(true);
    const payload = { ...draft, email: draft.email || null, phone: draft.phone || null, photoUrl: draft.photoUrl || null, bio: draft.bio || null };
    try {
      if (draft.id) await updateAdminBarber(draft.id, payload);
      else await createAdminBarber(payload);
      setDraft(null);
      await load();
      toast.success('Barbero guardado');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos guardar el barbero');
    } finally { setSaving(false); }
  }

  if (!catalog) return <PageSpinner />;
  const field = 'admin-input mt-1.5';
  return <div className="space-y-7"><AdminPageHeader eyebrow="Equipo publicado" title="Barberos" description="Los perfiles y servicios seleccionados se reflejan en la landing y en el flujo de reservación." action={<Button onClick={add}><Plus className="h-4 w-4" /> Agregar barbero</Button>} /><section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">{catalog.barbers.map((barber) => <article key={barber.id} className="admin-card overflow-hidden"><img src={barber.photoUrl || '/images/barber-1.webp'} alt={`Retrato de ${barber.displayName}`} className="aspect-square w-full object-cover" /><div className="p-4"><div className="flex items-start justify-between gap-2"><div className="min-w-0"><h2 className="truncate font-bold">{barber.displayName}</h2>{barber.email && <p className="mt-1 flex items-center gap-1 truncate text-xs text-slate-500"><Mail className="h-3 w-3" />{barber.email}</p>}</div><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${barber.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{barber.isActive ? 'Activo' : 'Oculto'}</span></div><p className="mt-4 line-clamp-3 min-h-[60px] text-sm leading-5 text-slate-600">{barber.bio || 'Sin descripción.'}</p><div className="mt-4 flex flex-wrap gap-1.5">{barber.serviceIds.slice(0, 3).map((id) => <span key={id} className="rounded-md bg-slate-100 px-2 py-1 text-[10px] text-slate-600">{catalog.services.find((service) => service.id === id)?.name}</span>)}</div><Button variant="outline" className="mt-4 w-full" onClick={() => setDraft({ ...barber })}><Pencil className="h-4 w-4" /> Editar perfil</Button></div></article>)}</section><Modal isOpen={Boolean(draft)} onClose={() => setDraft(null)} title={draft?.id ? 'Editar barbero' : 'Nuevo barbero'} size="lg">{draft && <div className="space-y-5"><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold sm:col-span-2">Nombre<input className={field} value={draft.displayName} onChange={(event) => setDraft({ ...draft, displayName: event.target.value })} /></label><label className="text-sm font-semibold">Correo<input type="email" className={field} value={draft.email || ''} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></label><label className="text-sm font-semibold">Teléfono<input className={field} value={draft.phone || ''} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></label><label className="text-sm font-semibold sm:col-span-2">URL de fotografía<input className={field} value={draft.photoUrl || ''} onChange={(event) => setDraft({ ...draft, photoUrl: event.target.value })} /></label><label className="text-sm font-semibold sm:col-span-2">Descripción<textarea className={`${field} min-h-24`} value={draft.bio || ''} onChange={(event) => setDraft({ ...draft, bio: event.target.value })} /></label><label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" className="h-5 w-5" checked={draft.isActive} onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })} /> Publicado</label></div><fieldset><legend className="text-sm font-semibold">Servicios que realiza</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{catalog.services.map((service) => <label key={service.id} className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 px-3 text-sm"><input type="checkbox" checked={draft.serviceIds.includes(service.id)} onChange={(event) => setDraft({ ...draft, serviceIds: event.target.checked ? [...draft.serviceIds, service.id] : draft.serviceIds.filter((id) => id !== service.id) })} />{service.name}</label>)}</div></fieldset><div className="flex justify-end gap-3 border-t border-slate-200 pt-5"><Button variant="ghost" onClick={() => setDraft(null)}>Cancelar</Button><Button onClick={() => void save()} loading={saving}>Guardar</Button></div></div>}</Modal></div>;
}
