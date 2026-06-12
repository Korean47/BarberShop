import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Mail, MessageCircle, Search, Star, UserPlus, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAppointments } from '../services/api';
import { AdminPageHeader } from '../components/admin/AdminPageHeader';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Modal } from '../components/ui/Modal';
import { feedbackItems } from '../data/adminDemo';
import { formatDateShort, formatPrice } from '../utils/helpers';
import type { Appointment, Customer } from '../types';

interface CustomerSummary extends Customer {
  visits: number;
  spent: number;
  lastVisit: string;
  favoriteService: string;
}

export function AdminCustomers() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<CustomerSummary | null>(null);

  useEffect(() => {
    let active = true;
    getAppointments()
      .then((items) => {
        if (active) setAppointments(items);
      })
      .catch(console.error);
    return () => {
      active = false;
    };
  }, []);

  const customers = useMemo(() => {
    const summaries = new Map<string, CustomerSummary>();
    appointments.forEach((appointment) => {
      const current = summaries.get(appointment.customer.id);
      const isActive = appointment.status !== 'cancelled';
      if (!current) {
        summaries.set(appointment.customer.id, {
          ...appointment.customer,
          visits: isActive ? 1 : 0,
          spent: isActive ? appointment.service.price : 0,
          lastVisit: appointment.date,
          favoriteService: appointment.service.name,
        });
        return;
      }
      if (isActive) {
        current.visits += 1;
        current.spent += appointment.service.price;
      }
      if (new Date(appointment.date) > new Date(current.lastVisit)) {
        current.lastVisit = appointment.date;
        current.favoriteService = appointment.service.name;
      }
    });
    return [...summaries.values()].sort((a, b) => b.spent - a.spent);
  }, [appointments]);

  const filteredCustomers = customers.filter((customer) =>
    `${customer.name} ${customer.email} ${customer.phone}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-7">
      <AdminPageHeader
        eyebrow="Relación con clientes"
        title="Clientes"
        description="Consulta historial, preferencias y valor de cada cliente para dar un seguimiento más personal."
        action={
          <Button onClick={() => toast.success('Formulario de cliente listo para la siguiente iteración')}>
            <UserPlus className="h-4 w-4" />
            Agregar cliente
          </Button>
        }
      />

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: 'Clientes registrados', value: Math.max(customers.length, 286), detail: '+18 este mes', icon: Users, color: 'text-blue-400' },
          { label: 'Clientes recurrentes', value: '68%', detail: 'Meta mensual: 72%', icon: CalendarDays, color: 'text-emerald-400' },
          { label: 'Satisfacción promedio', value: '4.8', detail: 'De 126 reseñas', icon: Star, color: 'text-brand-400' },
        ].map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.label} className="admin-card flex items-center gap-4 p-5">
              <div className="rounded-xl bg-white/5 p-3">
                <Icon className={`h-5 w-5 ${item.color}`} />
              </div>
              <div>
                <p className="text-xl font-bold text-white">{item.value}</p>
                <p className="text-sm text-slate-300">{item.label}</p>
                <p className="mt-0.5 text-xs text-slate-500">{item.detail}</p>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
        <article className="admin-card overflow-hidden">
          <div className="border-b border-white/5 p-4">
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nombre, correo o teléfono..."
              icon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-white/5 text-left text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3 font-medium">Cliente</th>
                  <th className="px-5 py-3 font-medium">Última visita</th>
                  <th className="px-5 py-3 font-medium">Visitas</th>
                  <th className="px-5 py-3 font-medium">Consumo</th>
                  <th className="px-5 py-3 font-medium">Preferencia</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredCustomers.map((customer) => (
                  <tr key={customer.id} className="hover:bg-white/[0.02]">
                    <td className="px-5 py-4">
                      <p className="text-sm font-medium text-white">{customer.name}</p>
                      <p className="text-xs text-slate-500">{customer.phone}</p>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-300">
                      {formatDateShort(new Date(customer.lastVisit))}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-300">{customer.visits}</td>
                    <td className="px-5 py-4 text-sm font-medium text-brand-400">
                      {formatPrice(customer.spent)}
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-400">{customer.favoriteService}</td>
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={() => setSelected(customer)}
                        className="text-xs font-medium text-brand-400 hover:text-brand-300"
                      >
                        Ver perfil
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>

        <article className="admin-card p-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Comentarios recientes</h3>
              <p className="mt-0.5 text-xs text-slate-500">Retroalimentación posterior a la cita</p>
            </div>
            <MessageCircle className="h-5 w-5 text-brand-400" />
          </div>
          <div className="mt-5 space-y-5">
            {feedbackItems.map((item) => (
              <div key={item.name} className="border-b border-white/5 pb-5 last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-white">{item.name}</p>
                  <span className="text-xs text-slate-500">{item.date}</span>
                </div>
                <div className="my-2 flex gap-0.5">
                  {Array.from({ length: 5 }, (_, index) => (
                    <Star
                      key={index}
                      className={`h-3.5 w-3.5 ${index < item.rating ? 'fill-brand-400 text-brand-400' : 'text-slate-700'}`}
                    />
                  ))}
                </div>
                <p className="text-xs leading-relaxed text-slate-400">“{item.comment}”</p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <Modal isOpen={Boolean(selected)} onClose={() => setSelected(null)} title="Perfil del cliente">
        {selected && (
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-lg font-bold text-brand-400">
                {selected.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
              </div>
              <div>
                <h3 className="font-semibold text-white">{selected.name}</h3>
                <p className="text-sm text-slate-500">Cliente desde {new Date(selected.createdAt).getFullYear()}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-xs text-slate-500">Visitas</p>
                <p className="mt-1 font-semibold text-white">{selected.visits}</p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-xs text-slate-500">Consumo acumulado</p>
                <p className="mt-1 font-semibold text-brand-400">{formatPrice(selected.spent)}</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-slate-300">
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-slate-500" /> {selected.email}</p>
              <p className="flex items-center gap-2"><MessageCircle className="h-4 w-4 text-slate-500" /> {selected.phone}</p>
            </div>
            <div className="rounded-xl border border-brand-500/15 bg-brand-500/5 p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-brand-400">Preferencias</p>
              <p className="mt-2 text-sm text-slate-300">Servicio frecuente: {selected.favoriteService}</p>
              <p className="mt-1 text-xs text-slate-500">Espacio preparado para notas, alergias y estilo habitual.</p>
            </div>
            <Button className="w-full" onClick={() => toast.success('Mensaje de seguimiento preparado')}>
              <MessageCircle className="h-4 w-4" />
              Enviar seguimiento
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
}
