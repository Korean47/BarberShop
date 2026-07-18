import { useEffect, useState } from 'react';
import { CheckCircle2, CreditCard, ExternalLink, ShieldCheck, TriangleAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminPageHeader } from '../components/admin/AdminPageHeader';
import { Button } from '../components/ui/Button';
import { getBilling, requestReactivation } from '../services/api';
import { formatPrice } from '../utils/helpers';

interface BillingData {
  status: string;
  currentPeriodEnd: string | null;
  graceEndsAt: string | null;
  plan: { name: string; priceCents: number; currency: string; billingPeriod: string };
}

const activeStatuses = ['ACTIVE', 'TRIAL', 'GRACE'];

export function AdminBilling() {
  const [billing, setBilling] = useState<BillingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);

  useEffect(() => {
    getBilling()
      .then(setBilling)
      .catch((error) => toast.error(error instanceof Error ? error.message : 'No pudimos consultar la suscripción'))
      .finally(() => setLoading(false));
  }, []);

  async function reactivate() {
    setWorking(true);
    try {
      const response = await requestReactivation();
      toast.success(response.message);
      if (response.portalUrl.startsWith('http')) window.location.assign(response.portalUrl);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos abrir el portal de pago');
    } finally {
      setWorking(false);
    }
  }

  const active = billing ? activeStatuses.includes(billing.status) : false;
  return (
    <div className="space-y-7 text-slate-200">
      <AdminPageHeader eyebrow="Cuenta" title="Suscripción y facturación" description="Consulta el estado del servicio y actualiza el método de pago desde el portal seguro." />
      {loading ? <div className="admin-card h-48 animate-pulse" /> : billing ? (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
          <section className="admin-card p-6 lg:p-8">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Plan actual</p>
                <h2 className="mt-2 text-2xl font-bold text-white">{billing.plan.name}</h2>
                <p className="mt-2 text-sm text-slate-400">{formatPrice(billing.plan.priceCents / 100)} por mes</p>
              </div>
              <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${active ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-amber-500/20 bg-amber-500/10 text-amber-200'}`}>
                {active ? <CheckCircle2 className="h-4 w-4" /> : <TriangleAlert className="h-4 w-4" />}
                {billing.status.replace('_', ' ')}
              </span>
            </div>
            <div className="mt-8 grid gap-4 border-t border-white/5 pt-6 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/[.03] p-4"><p className="text-xs text-slate-500">Próxima renovación</p><p className="mt-2 font-semibold text-white">{billing.currentPeriodEnd ? new Date(billing.currentPeriodEnd).toLocaleDateString('es-MX', { dateStyle: 'long' }) : 'Por confirmar'}</p></div>
              <div className="rounded-2xl bg-white/[.03] p-4"><p className="text-xs text-slate-500">Método</p><p className="mt-2 flex items-center gap-2 font-semibold text-white"><CreditCard className="h-4 w-4 text-brand-400" /> Portal seguro del proveedor</p></div>
            </div>
            <Button className="mt-7" onClick={reactivate} loading={working}>{active ? 'Administrar pago' : 'Reactivar servicio'} <ExternalLink className="h-4 w-4" /></Button>
          </section>
          <aside className="admin-card p-6">
            <ShieldCheck className="h-8 w-8 text-brand-400" />
            <h3 className="mt-5 font-semibold text-white">Tus datos se conservan</h3>
            <p className="mt-2 text-sm leading-6 text-slate-400">Una suspensión bloquea nuevas operaciones, pero no elimina citas, clientes, pagos ni configuración. La reactivación se aplica al confirmarse el pago por webhook.</p>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
