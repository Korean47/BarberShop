import { useMemo, useState } from 'react';
import { Package, PackageCheck, Plus, Search, ShoppingCart, TriangleAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminPageHeader } from '../components/admin/AdminPageHeader';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { inventoryItems } from '../data/adminDemo';
import { formatPrice } from '../utils/helpers';

export function AdminInventory() {
  const [query, setQuery] = useState('');
  const filteredItems = useMemo(
    () => inventoryItems.filter((item) => `${item.name} ${item.category}`.toLowerCase().includes(query.toLowerCase())),
    [query],
  );
  const lowStock = inventoryItems.filter((item) => item.stock <= item.minimum);
  const inventoryValue = inventoryItems.reduce((sum, item) => sum + item.stock * item.cost, 0);

  return (
    <div className="space-y-7">
      <AdminPageHeader
        eyebrow="Insumos y productos"
        title="Inventario"
        description="Controla existencias mínimas, costos y compras pendientes para evitar quedarte sin material en horas de trabajo."
        action={
          <Button onClick={() => toast.success('Entrada de inventario preparada')}>
            <Plus className="h-4 w-4" />
            Registrar entrada
          </Button>
        }
      />

      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 px-4 py-3 text-sm text-blue-200">
        Módulo demostrativo con datos de ejemplo. La operación final incluiría movimientos, proveedores y órdenes de compra.
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Productos controlados', value: inventoryItems.length, icon: Package, tone: 'text-blue-400' },
          { label: 'Stock bajo', value: lowStock.length, icon: TriangleAlert, tone: 'text-red-400' },
          { label: 'Valor del inventario', value: formatPrice(inventoryValue), icon: PackageCheck, tone: 'text-emerald-400' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="admin-card flex items-center gap-4 p-5">
              <div className="rounded-xl bg-white/5 p-3">
                <Icon className={`h-5 w-5 ${item.tone}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{item.value}</p>
                <p className="text-sm text-slate-400">{item.label}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="admin-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-white/5 p-4 sm:flex-row sm:items-center">
          <div className="max-w-md flex-1">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar producto o categoría..."
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <Button variant="outline" onClick={() => toast.success('Orden de compra creada')}>
            <ShoppingCart className="h-4 w-4" />
            Crear orden de compra
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px]">
            <thead>
              <tr className="border-b border-white/5 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="px-5 py-3 font-medium">Producto</th>
                <th className="px-5 py-3 font-medium">Categoría</th>
                <th className="px-5 py-3 font-medium">Existencia</th>
                <th className="px-5 py-3 font-medium">Nivel</th>
                <th className="px-5 py-3 font-medium">Costo unitario</th>
                <th className="px-5 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.map((item) => {
                const percentage = Math.min((item.stock / Math.max(item.minimum * 2, 1)) * 100, 100);
                const isLow = item.stock <= item.minimum;
                return (
                  <tr key={item.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-4 text-sm font-medium text-white">{item.name}</td>
                    <td className="px-5 py-4 text-sm text-slate-400">{item.category}</td>
                    <td className="px-5 py-4 text-sm text-slate-300">{item.stock} {item.unit}</td>
                    <td className="px-5 py-4">
                      <div className="h-1.5 w-28 overflow-hidden rounded-full bg-slate-800">
                        <div
                          className={`h-full rounded-full ${isLow ? 'bg-red-400' : 'bg-emerald-400'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="mt-1 text-xs text-slate-600">Mínimo: {item.minimum}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-300">{formatPrice(item.cost)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-full px-2.5 py-1 text-xs ${isLow ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {isLow ? 'Reponer' : 'Disponible'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
