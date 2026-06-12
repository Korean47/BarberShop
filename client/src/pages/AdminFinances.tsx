import { useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Download, Plus, ReceiptText, WalletCards } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminPageHeader } from '../components/admin/AdminPageHeader';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { expenses, monthlyRevenue } from '../data/adminDemo';
import { formatPrice } from '../utils/helpers';

export function AdminFinances() {
  const [expenseModal, setExpenseModal] = useState(false);
  const income = monthlyRevenue.at(-1)?.value || 0;
  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const profit = income - totalExpenses;

  return (
    <div className="space-y-7">
      <AdminPageHeader
        eyebrow="Control administrativo"
        title="Finanzas"
        description="Una vista sencilla de ingresos, gastos y utilidad para tomar decisiones sin depender de hojas separadas."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => toast.success('Reporte mensual generado')}>
              <Download className="h-4 w-4" />
              Exportar
            </Button>
            <Button onClick={() => setExpenseModal(true)}>
              <Plus className="h-4 w-4" />
              Registrar gasto
            </Button>
          </div>
        }
      />

      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm text-blue-200">
        Vista demostrativa. En una siguiente fase se conectaría con pagos, facturación y conciliación bancaria.
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        <article className="admin-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Ingresos del mes</span>
            <ArrowUpRight className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{formatPrice(income)}</p>
          <p className="mt-2 text-xs text-emerald-400">+5.3% contra el mes anterior</p>
        </article>
        <article className="admin-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Gastos registrados</span>
            <ArrowDownRight className="h-5 w-5 text-red-400" />
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{formatPrice(totalExpenses)}</p>
          <p className="mt-2 text-xs text-slate-500">38% corresponde a costos fijos</p>
        </article>
        <article className="admin-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-slate-400">Utilidad estimada</span>
            <WalletCards className="h-5 w-5 text-brand-400" />
          </div>
          <p className="mt-3 text-2xl font-bold text-white">{formatPrice(profit)}</p>
          <p className="mt-2 text-xs text-brand-400">Margen estimado de {Math.round((profit / income) * 100)}%</p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.3fr_0.9fr]">
        <article className="admin-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Flujo de ingresos</h3>
              <p className="mt-0.5 text-xs text-slate-500">Comportamiento de los últimos seis meses</p>
            </div>
            <span className="rounded-lg bg-white/5 px-3 py-1.5 text-xs text-slate-400">2026</span>
          </div>
          <div className="mt-8 flex h-64 items-end gap-4">
            {monthlyRevenue.map((item, index) => (
              <div key={item.month} className="flex h-full flex-1 flex-col justify-end gap-2">
                <div
                  className={`rounded-t-xl ${index === monthlyRevenue.length - 1 ? 'bg-brand-500' : 'bg-slate-700'}`}
                  style={{ height: `${(item.value / 90000) * 100}%` }}
                  title={formatPrice(item.value)}
                />
                <span className="text-center text-xs text-slate-500">{item.month}</span>
              </div>
            ))}
          </div>
        </article>

        <article className="admin-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/5 p-5">
            <div>
              <h3 className="font-semibold text-white">Gastos recientes</h3>
              <p className="mt-0.5 text-xs text-slate-500">Movimientos del mes</p>
            </div>
            <ReceiptText className="h-5 w-5 text-brand-400" />
          </div>
          <div className="divide-y divide-white/5">
            {expenses.map((expense) => (
              <div key={expense.id} className="flex items-center gap-3 px-5 py-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-500/10">
                  <ArrowDownRight className="h-4 w-4 text-red-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{expense.concept}</p>
                  <p className="text-xs text-slate-500">{expense.category} · {expense.date.slice(5)}</p>
                </div>
                <p className="text-sm font-semibold text-slate-200">-{formatPrice(expense.amount)}</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="admin-card p-5">
        <div className="grid gap-5 md:grid-cols-4">
          {[
            { label: 'Servicios cobrados', value: '180', detail: 'Ticket promedio $479' },
            { label: 'Pagos en efectivo', value: '42%', detail: '$36,220' },
            { label: 'Pagos con tarjeta', value: '51%', detail: '$43,980' },
            { label: 'Transferencias', value: '7%', detail: '$6,040' },
          ].map((item) => (
            <div key={item.label} className="border-b border-white/5 pb-4 last:border-0 md:border-b-0 md:border-r md:pb-0 md:last:border-r-0">
              <p className="text-xs text-slate-500">{item.label}</p>
              <p className="mt-2 text-xl font-bold text-white">{item.value}</p>
              <p className="mt-1 text-xs text-slate-400">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <Modal isOpen={expenseModal} onClose={() => setExpenseModal(false)} title="Registrar gasto">
        <form
          className="space-y-4"
          onSubmit={(event) => {
            event.preventDefault();
            setExpenseModal(false);
            toast.success('Gasto registrado en la demostración');
          }}
        >
          <label className="block text-sm text-slate-300">
            Concepto
            <input required className="admin-input mt-2" placeholder="Ej. Compra de productos" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm text-slate-300">
              Importe
              <input required type="number" className="admin-input mt-2" placeholder="$0.00" />
            </label>
            <label className="block text-sm text-slate-300">
              Categoría
              <select className="admin-input mt-2">
                <option>Insumos</option>
                <option>Operación</option>
                <option>Servicios</option>
                <option>Marketing</option>
              </select>
            </label>
          </div>
          <label className="block text-sm text-slate-300">
            Notas
            <textarea className="admin-input mt-2 min-h-24 resize-none" placeholder="Proveedor, folio o comentario..." />
          </label>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setExpenseModal(false)}>Cancelar</Button>
            <Button type="submit">Guardar gasto</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
