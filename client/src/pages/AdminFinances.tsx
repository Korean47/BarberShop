import { useEffect, useState } from 'react';
import { CircleDollarSign, Clock3, Download, ReceiptText, RotateCcw, TriangleAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminPageHeader } from '../components/admin/AdminPageHeader';
import { Button } from '../components/ui/Button';
import { PageSpinner } from '../components/ui/Spinner';
import { getAdminPayments, markAdminCashPaymentPaid } from '../services/api';
import type { AdminPaymentsData } from '../types';
import { formatDateShort, formatPrice } from '../utils/helpers';

export function AdminFinances() {
  const [data, setData] = useState<AdminPaymentsData | null>(null);
  const [status, setStatus] = useState('');
  const [method, setMethod] = useState('');
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getAdminPayments({ status: status || undefined, method: method || undefined })
      .then((value) => active && setData(value))
      .catch((error) => toast.error(error instanceof Error ? error.message : 'No pudimos cargar los pagos'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [method, status]);

  function exportCsv() {
    if (!data?.items.length) {
      toast.error('No hay pagos para exportar');
      return;
    }
    const rows = [
      ['Fecha', 'Código', 'Cliente', 'Servicio', 'Método', 'Estado', 'Importe', 'Proveedor'],
      ...data.items.map((item) => [item.createdAt, item.appointment.publicCode, item.appointment.customer.name, item.appointment.services.map(({ name }) => name).join(' + '), methodLabel(item.method), statusLabel(item.status), String(item.amountCents / 100), item.provider || 'local']),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\r\n');
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }));
    link.download = `pagos-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  async function markPaid(id: string) {
    setWorking(id);
    try {
      await markAdminCashPaymentPaid(id);
      setData(await getAdminPayments({ status: status || undefined, method: method || undefined }));
      toast.success('Cobro registrado');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'No pudimos registrar el cobro');
    } finally { setWorking(null); }
  }

  if (!data && loading) return <PageSpinner />;
  if (!data) return null;

  return (
    <div className="space-y-7">
      <AdminPageHeader eyebrow="Operación real" title="Pagos y caja" description="Cada reservación genera un registro de pago; aprobaciones, rechazos, vencimientos y cobros locales comparten esta fuente." action={<Button variant="outline" onClick={exportCsv}><Download className="h-4 w-4" /> Exportar CSV</Button>} />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Cobrado en línea" value={data.summary.paidCents} icon={<CircleDollarSign className="h-5 w-5 text-emerald-700" />} tone="bg-emerald-50" />
        <SummaryCard label="Pendiente / por cobrar" value={data.summary.pendingCents} icon={<Clock3 className="h-5 w-5 text-amber-700" />} tone="bg-amber-50" />
        <SummaryCard label="Fallido o cancelado" value={data.summary.failedCents} icon={<TriangleAlert className="h-5 w-5 text-red-700" />} tone="bg-red-50" />
        <SummaryCard label="Reembolsado" value={data.summary.refundedCents} icon={<RotateCcw className="h-5 w-5 text-slate-600" />} tone="bg-slate-100" />
      </section>

      <section className="admin-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="flex items-center gap-2 font-bold"><ReceiptText className="h-4 w-4" /> Movimientos</h2><p className="mt-1 text-xs text-slate-500">Hasta 500 registros recientes · {data.items.length} resultado(s)</p></div><div className="flex flex-col gap-2 min-[420px]:flex-row"><label className="sr-only" htmlFor="payment-method">Método</label><select id="payment-method" className="admin-input min-w-40" value={method} onChange={(event) => { setLoading(true); setMethod(event.target.value); }}><option value="">Todos los métodos</option><option value="cash">En el local</option><option value="online">En línea</option></select><label className="sr-only" htmlFor="payment-status">Estado</label><select id="payment-status" className="admin-input min-w-40" value={status} onChange={(event) => { setLoading(true); setStatus(event.target.value); }}><option value="">Todos los estados</option><option value="pending">Pendiente</option><option value="paid">Pagado</option><option value="failed">Fallido</option><option value="cancelled">Cancelado</option><option value="refunded">Reembolsado</option></select></div></div>
        <div className="overflow-x-auto"><table className="min-w-[840px] w-full text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-4 py-3">Fecha</th><th className="px-4 py-3">Cliente / cita</th><th className="px-4 py-3">Servicio</th><th className="px-4 py-3">Método</th><th className="px-4 py-3">Importe</th><th className="px-4 py-3">Estado</th></tr></thead><tbody className="divide-y divide-slate-100">{data.items.map((item) => <tr key={item.id} className="hover:bg-slate-50/70"><td className="whitespace-nowrap px-4 py-3"><strong className="block text-slate-800">{formatDateShort(new Date(item.createdAt))}</strong><span className="text-xs text-slate-500">{new Date(item.createdAt).toLocaleTimeString('es-MX', { hour: 'numeric', minute: '2-digit' })}</span></td><td className="px-4 py-3"><strong className="block text-slate-800">{item.appointment.customer.name}</strong><span className="font-mono text-xs text-slate-500">{item.appointment.publicCode}</span></td><td className="px-4 py-3"><span className="block max-w-56 truncate text-slate-700">{item.appointment.services.map(({ name }) => name).join(' + ')}</span><span className="text-xs text-slate-500">{item.appointment.barber.name}</span></td><td className="px-4 py-3"><span className="font-semibold text-slate-700">{methodLabel(item.method)}</span><span className="block text-xs text-slate-500">{item.provider || 'Caja'}</span></td><td className="px-4 py-3 font-bold text-slate-900">{formatPrice(item.amountCents / 100)}</td><td className="px-4 py-3"><span className={`badge ${statusClass(item.status)}`}>{statusLabel(item.status)}</span>{item.appointment.status === 'cancelled' && <span className="mt-1 block text-[10px] text-slate-500">Cita cancelada</span>}{item.method === 'cash' && item.status === 'pending' && item.appointment.status !== 'cancelled' && <button type="button" className="mt-2 block text-xs font-semibold text-[#183A44] underline" disabled={working === item.id} onClick={() => void markPaid(item.id)}>{working === item.id ? 'Guardando…' : 'Marcar cobrado'}</button>}</td></tr>)}{!loading && data.items.length === 0 && <tr><td colSpan={6} className="px-5 py-14 text-center text-slate-500">No hay pagos con estos filtros.</td></tr>}</tbody></table></div>
      </section>
    </div>
  );
}

function SummaryCard({ label, value, icon, tone }: { label: string; value: number; icon: React.ReactNode; tone: string }) {
  return <article className="admin-card p-5"><div className={`grid h-10 w-10 place-items-center rounded-xl ${tone}`}>{icon}</div><p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-2xl font-bold text-slate-900">{formatPrice(value / 100)}</p></article>;
}

function methodLabel(method: AdminPaymentsData['items'][number]['method']) {
  return method === 'online' ? 'En línea' : 'En el local';
}

function statusLabel(status: AdminPaymentsData['items'][number]['status']) {
  return { pending: 'Pendiente', authorized: 'Autorizado', paid: 'Pagado', failed: 'Fallido', cancelled: 'Cancelado', refunded: 'Reembolsado', partially_refunded: 'Reembolso parcial' }[status];
}

function statusClass(status: AdminPaymentsData['items'][number]['status']) {
  if (status === 'paid') return 'badge-confirmed';
  if (status === 'pending' || status === 'authorized') return 'badge-pending';
  if (status === 'failed' || status === 'cancelled') return 'badge-cancelled';
  return 'border-slate-200 bg-slate-100 text-slate-700';
}
