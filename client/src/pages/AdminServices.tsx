import { useEffect, useState } from 'react';
import { Clock3, Pencil, Plus, Tags } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminPageHeader } from '../components/admin/AdminPageHeader';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { PageSpinner } from '../components/ui/Spinner';
import { createAdminCategory, createAdminService, getAdminCatalog, updateAdminCategory, updateAdminService } from '../services/api';
import type { AdminCatalogData } from '../types';
import { formatPrice } from '../utils/helpers';

type ServiceDraft = AdminCatalogData['services'][number];
type CategoryDraft = AdminCatalogData['categories'][number];

export function AdminServices() {
  const [catalog, setCatalog] = useState<AdminCatalogData | null>(null);
  const [draft, setDraft] = useState<ServiceDraft | null>(null);
  const [categoryDraft, setCategoryDraft] = useState<CategoryDraft | null>(null);
  const [saving, setSaving] = useState(false);

  const load = () => getAdminCatalog().then(setCatalog).catch((error) => toast.error(error instanceof Error ? error.message : 'No pudimos cargar el catálogo'));
  useEffect(() => { void load(); }, []);

  function addService() {
    if (!catalog?.categories[0]) {
      toast.error('Crea una categoría antes de agregar servicios');
      return;
    }
    setDraft({ id: '', name: '', description: '', imageUrl: '', durationMinutes: 30, priceCents: 20000, priceType: 'FIXED', categoryId: catalog.categories[0].id, isActive: true, sortOrder: catalog.services.length, barberIds: [] });
  }

  async function saveService() {
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

  async function saveCategory() {
    if (!categoryDraft) return;
    setSaving(true);
    try {
      if (categoryDraft.id) await updateAdminCategory(categoryDraft.id, categoryDraft);
      else await createAdminCategory(categoryDraft);
      setCategoryDraft(null);
      await load();
      toast.success('Categoría guardada');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos guardar la categoría');
    } finally { setSaving(false); }
  }

  if (!catalog) return <PageSpinner />;
  const field = 'admin-input mt-1.5';

  return (
    <div className="space-y-7">
      <AdminPageHeader eyebrow="Catálogo público" title="Servicios" description="Categorías, fotografías, precios, duraciones, orden y barberos se publican desde esta sección." action={<Button onClick={addService}><Plus className="h-4 w-4" /> Agregar servicio</Button>} />

      <section className="admin-card p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="flex items-center gap-2 font-bold"><Tags className="h-4 w-4" /> Categorías</h2><p className="mt-1 text-xs text-slate-500">El orden y la visibilidad se reflejan en la reserva.</p></div><Button variant="outline" onClick={() => setCategoryDraft({ id: '', name: '', sortOrder: catalog.categories.length, isActive: true })}><Plus className="h-4 w-4" /> Agregar categoría</Button></div>
        <div className="mt-4 flex flex-wrap gap-2">{catalog.categories.map((category) => <button type="button" key={category.id} onClick={() => setCategoryDraft({ ...category })} className={`inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 text-sm font-semibold ${category.isActive ? 'border-slate-200 bg-white text-slate-700' : 'border-dashed border-slate-300 bg-slate-50 text-slate-400'}`}>{category.name}<Pencil className="h-3.5 w-3.5" /></button>)}</div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {catalog.services.map((service) => <article key={service.id} className="admin-card overflow-hidden"><img src={service.imageUrl || '/images/corte-clasico.webp'} alt={`Referencia de ${service.name}`} className="aspect-[16/9] w-full object-cover" /><div className="p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="font-bold">{service.name}</h2><p className="mt-1 text-xs text-slate-500">{catalog.categories.find((item) => item.id === service.categoryId)?.name}</p></div><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${service.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{service.isActive ? 'Publicado' : 'Oculto'}</span></div><div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4"><span className="flex items-center gap-1.5 text-sm text-slate-500"><Clock3 className="h-4 w-4" /> {service.durationMinutes} min</span><strong className="text-[#B8543C]">{priceLabel(service)}</strong></div><Button variant="outline" className="mt-4 w-full" onClick={() => setDraft({ ...service, barberIds: [...service.barberIds] })}><Pencil className="h-4 w-4" /> Editar</Button></div></article>)}
      </section>

      <Modal isOpen={Boolean(draft)} onClose={() => setDraft(null)} title={draft?.id ? 'Editar servicio' : 'Nuevo servicio'} size="lg">
        {draft && <div className="space-y-5"><div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold sm:col-span-2">Nombre<input className={field} value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label><label className="text-sm font-semibold sm:col-span-2">Descripción breve<textarea className={`${field} min-h-20`} value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} /></label><label className="text-sm font-semibold sm:col-span-2">URL de imagen<input className={field} value={draft.imageUrl || ''} onChange={(event) => setDraft({ ...draft, imageUrl: event.target.value })} /></label><label className="text-sm font-semibold">Precio en MXN<input type="number" min="0" className={field} value={draft.priceCents / 100} onChange={(event) => setDraft({ ...draft, priceCents: Math.round(Number(event.target.value) * 100) })} /></label><label className="text-sm font-semibold">Tipo de precio<select className={field} value={draft.priceType} onChange={(event) => setDraft({ ...draft, priceType: event.target.value as ServiceDraft['priceType'] })}><option value="FIXED">Fijo</option><option value="STARTING_AT">Desde</option><option value="ESTIMATE">Aproximado</option><option value="CONFIRM">Por confirmar</option></select></label><label className="text-sm font-semibold">Duración (min)<input type="number" min="10" max="240" className={field} value={draft.durationMinutes} onChange={(event) => setDraft({ ...draft, durationMinutes: Number(event.target.value) })} /></label><label className="text-sm font-semibold">Categoría<select className={field} value={draft.categoryId} onChange={(event) => setDraft({ ...draft, categoryId: event.target.value })}>{catalog.categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label className="text-sm font-semibold">Orden<input type="number" min="0" className={field} value={draft.sortOrder} onChange={(event) => setDraft({ ...draft, sortOrder: Number(event.target.value) })} /></label><label className="flex items-center gap-3 self-end pb-3 text-sm font-semibold"><input type="checkbox" className="h-5 w-5" checked={draft.isActive} onChange={(event) => setDraft({ ...draft, isActive: event.target.checked })} /> Publicado</label></div><fieldset><legend className="text-sm font-semibold">Barberos que realizan el servicio</legend><div className="mt-3 grid gap-2 sm:grid-cols-2">{catalog.barbers.map((barber) => <label key={barber.id} className="flex min-h-11 items-center gap-3 rounded-xl border border-slate-200 px-3 text-sm"><input type="checkbox" checked={draft.barberIds.includes(barber.id)} onChange={(event) => setDraft({ ...draft, barberIds: event.target.checked ? [...draft.barberIds, barber.id] : draft.barberIds.filter((id) => id !== barber.id) })} />{barber.displayName}</label>)}</div></fieldset><div className="flex justify-end gap-3 border-t border-slate-200 pt-5"><Button variant="ghost" onClick={() => setDraft(null)}>Cancelar</Button><Button onClick={() => void saveService()} loading={saving}>Guardar</Button></div></div>}
      </Modal>

      <Modal isOpen={Boolean(categoryDraft)} onClose={() => setCategoryDraft(null)} title={categoryDraft?.id ? 'Editar categoría' : 'Nueva categoría'}>
        {categoryDraft && <div className="space-y-5"><label className="block text-sm font-semibold">Nombre<input className={field} value={categoryDraft.name} onChange={(event) => setCategoryDraft({ ...categoryDraft, name: event.target.value })} /></label><label className="block text-sm font-semibold">Orden<input type="number" min="0" className={field} value={categoryDraft.sortOrder} onChange={(event) => setCategoryDraft({ ...categoryDraft, sortOrder: Number(event.target.value) })} /></label><label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" className="h-5 w-5" checked={categoryDraft.isActive} onChange={(event) => setCategoryDraft({ ...categoryDraft, isActive: event.target.checked })} /> Visible en la reserva</label><div className="flex justify-end gap-3 border-t border-slate-200 pt-5"><Button variant="ghost" onClick={() => setCategoryDraft(null)}>Cancelar</Button><Button onClick={() => void saveCategory()} loading={saving}>Guardar</Button></div></div>}
      </Modal>
    </div>
  );
}

function priceLabel(service: ServiceDraft) {
  if (service.priceType === 'CONFIRM') return 'Por confirmar';
  const price = formatPrice(service.priceCents / 100);
  if (service.priceType === 'STARTING_AT') return `Desde ${price}`;
  if (service.priceType === 'ESTIMATE') return `Aprox. ${price}`;
  return price;
}
