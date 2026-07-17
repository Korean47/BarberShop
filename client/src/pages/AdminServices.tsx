import { useEffect, useState } from 'react';
import { Clock3, Pencil, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminPageHeader } from '../components/admin/AdminPageHeader';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { PageSpinner } from '../components/ui/Spinner';
import { createAdminService, getAdminCatalog, updateAdminService } from '../services/api';
import type { AdminCatalogData } from '../types';
import { formatPrice } from '../utils/helpers';

type ServiceDraft = AdminCatalogData['services'][number];

export function AdminServices() {
  const [catalog, setCatalog] = useState<AdminCatalogData | null>(null);
  const [draft, setDraft] = useState<ServiceDraft | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => getAdminCatalog().then(setCatalog).catch((error) => toast.error(error instanceof Error ? error.message : 'No pudimos cargar el catálogo'));
  useEffect(() => { void load(); }, []);

  function add() {
    if (!catalog?.categories[0]) return;
    setDraft({ id: '', name: '', description: '', imageUrl: '', durationMinutes: 30, priceCents: 20000, priceType: 'FIXED', categoryId: catalog.categories[0].id, isActive: true, sortOrder: catalog.services.length, barberIds: [] });
  }

  async function save() {
    if (!draft) return;
    setSaving(true);
    const payload = { ...draft, imageUrl: draft.imageUrl || null };
    try {
      if (draft.id) await updateAdminService(draft.id, payload);
      else await createAdminService(payload);
      setDraft(null);
      await load();
      toast.success('Servicio guardado');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos guardar el servicio');
    } finally { setSaving(false); }
  }

  if (!catalog) return <PageSpinner />;
  const field = 'admin-input mt-1.5';

  return <div className="space-y-7"><AdminPageHeader eyebrow="Catálogo público" title="Servicios" description="Nombre, fotografía, precio, duración, categoría, orden y barberos se publican desde esta sección." action={<Button onClick={add}><Plus className="h-4 w-4" /> Agregar servicio</Button>} /><section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{catalog.services.map((service) => <article key={service.id} className="admin-card overflow-hidden"><img src={service.imageUrl || '/images/corte-clasico.webp'} alt={`Referencia de ${service.name}`} className="aspect-[16/9] w-full object-cover" /><div className="p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="font-bold">{service.name}</h2><p className="mt-1 text-xs text-slate-500">{catalog.categories.find((item) => item.id === service.categoryId)?.name}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${service.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{service.isActive ? 'Publicado' : 'Oculto'}</span></div><div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4"><span className="flex items-center gap-1.5 text-sm text-slate-500"><Clock3 className="h-4 w-4" /> {service.durationMinutes} min</span><strong className="text-[#B8543C]">{service.priceType === 'CONFIRM' ? 'Por confirmar' : formatPrice(service.priceCents / 100)}</strong></div><Button variant="outline" className="mt-4 w-full" onClick={() => setDraft({ ...service })}><Pencil className="h-4 w-4" /> Editar</Button></div></article>)}</section><Modal isOpen={Boolean(draft)} onClose={() => setDraft(null)} title={draft?.id ? 'Editar servicio' : 'Nuevo servicio'} size="lg">{draft && <div className="space-y-5"><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold sm:col-span-2">Nombre<input className={field} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label><label className="text-sm font-semibold sm:col-span-2">Descripción breve<textarea className={`${field} min-h-20`} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label><label className="text-sm font-semibold sm:col-span-2">URL de imagen<input className={field} value={draft.imageUrl || ''} onChange={(event) => setDraft({ ...draft, imageUrl: event.target.value })} /></label><label className="text-sm font-semibold">Precio en MXN<input type="number" min="0" className={field} value={draft.priceCents / 100} onChange={(event) => setDraft({ ...draft, priceCents: Math.round(Number(event.target.value) * 100) })} /></label><label className="text-sm font-semibold">Tipo de precio<select className={field} value={draft.priceType} onChange={(event) => setDraft({ ...draft, priceType: event.target.value as ServiceDraft['priceType'] })}><option value="FIXED">Fijo</option><option value="STARTING_AT">Desde</option><option value="ESTIMATE">Aproximado</option><option value="CONFIRM">Por confirmar</option></select></label><label className="text-sm font-semibold">Duración (min)<input type="number" min="10" max="240" className={field} value={draft.durationMinutes} onChange={(event) => setDraft({ ...draft, durationMinutes: Number(event.target.value) })} /></label><label className="text-sm font-semibold">Categoría<select className={field} value={draft.categoryId} onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })}>{catalog.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="text-sm font-semibold">Orden<input type="number" min="0" className={field} value={draft.sortOrder} onChange={(event) => setDraft({ ...draft, sortOrder: Number(event.target.value) })} /></label><label className="flex items-center gap-3 self-end pb-3 text-sm font-semibold"><input type="checkbox" className="h-5 w-5" checked={draft.isActive} onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })} /> Publicado</label></div><fieldset><legend className="text-sm font-semibold">Barberos que realizan el servicio</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{catalog.barbers.map((barber) => <label key={barber.id} className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 px-3 text-sm"><input type="checkbox" checked={draft.barberIds.includes(barber.id)} onChange={(event) => setDraft({ ...draft, barberIds: event.target.checked ? [...draft.barberIds, barber.id] : draft.barberIds.filter((id) => id !== barber.id) })} />{barber.displayName}</label>)}</div></fieldset><div className="flex justify-end gap-3 border-t border-slate-200 pt-5"><Button variant="ghost" onClick={() => setDraft(null)}>Cancelar</Button><Button onClick={() => void save()} loading={saving}>Guardar</Button></div></div>}</Modal></div>;
}
