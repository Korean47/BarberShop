import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  DollarSign,
  Package,
  Sparkles,
  TrendingUp,
  TriangleAlert,
  UserPlus,
  Users,
  WalletCards,
} from 'lucide-react';
import { getAppointments, getBarbers } from '../services/api';
import { inventoryItems, monthlyRevenue, teamPerformance } from '../data/adminDemo';
import { formatPrice, formatTime } from '../utils/helpers';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import type { Appointment, Barber } from '../types';

const todayKey = new Date().toISOString().slice(0, 10);

export function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [barbers, setBarbers] = useState<Barber[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([getAppointments(), getBarbers()])
      .then(([appointmentList, barberList]) => {
        if (!active) return;
        setAppointments(appointmentList);
        setBarbers(barberList);
      })
      .catch(console.error)
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const todayAppointments = useMemo(
    () =>
      appointments
        .filter((appointment) => appointment.date.slice(0, 10) === todayKey)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [appointments],
  );

  const activeAppointments = todayAppointments.filter((item) => item.status !== 'cancelled');
  const completed = activeAppointments.filter((item) => item.status === 'completed');
  const pending = activeAppointments.filter((item) => item.status === 'pending');
  const projectedRevenue = activeAppointments.reduce((sum, item) => sum + item.service.price, 0);
  const lowStock = inventoryItems.filter((item) => item.stock <= item.minimum);
  const maxRevenue = Math.max(...monthlyRevenue.map((item) => item.value));

  const stats = [
    {
      label: 'Citas de hoy',
      value: activeAppointments.length,
      detail: `${completed.length} servicios terminados`,
      icon: CalendarDays,
      tone: 'bg-blue-500/10 text-blue-400',
    },
    {
      label: 'Ingreso proyectado',
      value: formatPrice(projectedRevenue),
      detail: 'Antes de propinas y productos',
      icon: DollarSign,
      tone: 'bg-emerald-500/10 text-emerald-400',
    },
    {
      label: 'Ocupación',
      value: '82%',
      detail: '+6% contra la semana pasada',
      icon: TrendingUp,
      tone: 'bg-brand-500/10 text-brand-400',
    },
    {
      label: 'Clientes activos',
      value: '286',
      detail: '18 clientes nuevos este mes',
      icon: Users,
      tone: 'bg-violet-500/10 text-violet-400',
    },
  ];

  return (
    <div className="space-y-7">
      <section className="relative overflow-hidden rounded-3xl border border-brand-500/20 bg-gradient-to-r from-brand-500/15 via-slate-900 to-slate-900 p-6 lg:p-8">
        <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-brand-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-brand-500/20 bg-brand-500/10 px-3 py-1 text-xs font-medium text-brand-300">
              <Sparkles className="h-3.5 w-3.5" />
              Resumen de operación
            </div>
            <h2 className="font-display text-3xl font-bold text-white">
              Buenos días, Alejandro
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-400">
              Hoy tienes {activeAppointments.length} citas programadas y una ocupación saludable.
              Hay {pending.length} cita{pending.length === 1 ? '' : 's'} por confirmar y {lowStock.length}{' '}
              insumos que conviene reponer.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link to="/book">
              <Button variant="outline">
                <UserPlus className="h-4 w-4" />
                Nueva cita
              </Button>
            </Link>
            <Link to="/admin/appointments">
              <Button>
                Ver agenda
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <article key={stat.label} className="admin-card p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-slate-400">{stat.label}</p>
                  <p className="mt-2 text-2xl font-bold text-white">{loading ? '...' : stat.value}</p>
                </div>
                <div className={`rounded-xl p-3 ${stat.tone}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <p className="mt-4 text-xs text-slate-500">{stat.detail}</p>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <article className="admin-card overflow-hidden">
          <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
            <div>
              <h3 className="font-semibold text-white">Agenda de hoy</h3>
              <p className="mt-0.5 text-xs text-slate-500">Seguimiento rápido de cada servicio</p>
            </div>
            <Link to="/admin/appointments" className="text-xs font-medium text-brand-400 hover:text-brand-300">
              Agenda completa
            </Link>
          </div>
          <div className="divide-y divide-white/5">
            {activeAppointments.slice(0, 5).map((appointment) => (
              <div key={appointment.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/[0.02]">
                <div className="w-16 shrink-0">
                  <p className="text-sm font-semibold text-white">{formatTime(appointment.startTime)}</p>
                  <p className="text-[11px] text-slate-500">{appointment.service.duration} min</p>
                </div>
                <img
                  src={appointment.barber.photo}
                  alt={appointment.barber.name}
                  className="h-10 w-10 rounded-xl object-cover"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">{appointment.customer.name}</p>
                  <p className="truncate text-xs text-slate-500">
                    {appointment.service.name} · {appointment.barber.name}
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold text-brand-400">{formatPrice(appointment.service.price)}</p>
                  <Badge status={appointment.status} />
                </div>
              </div>
            ))}
            {!loading && activeAppointments.length === 0 && (
              <div className="px-5 py-12 text-center">
                <CalendarDays className="mx-auto h-8 w-8 text-slate-600" />
                <p className="mt-3 text-sm text-slate-400">No hay citas programadas para hoy.</p>
              </div>
            )}
          </div>
        </article>

        <article className="admin-card p-5">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-white">Ingresos mensuales</h3>
              <p className="mt-0.5 text-xs text-slate-500">Últimos 6 meses</p>
            </div>
            <div className="rounded-lg bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
              +5.3%
            </div>
          </div>
          <div className="mt-7 flex h-44 items-end gap-3">
            {monthlyRevenue.map((item) => (
              <div key={item.month} className="flex h-full flex-1 flex-col justify-end gap-2">
                <div
                  className="group relative rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 transition-opacity hover:opacity-90"
                  style={{ height: `${Math.max((item.value / maxRevenue) * 100, 12)}%` }}
                >
                  <span className="absolute -top-7 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-950 px-2 py-1 text-[10px] text-white group-hover:block">
                    {formatPrice(item.value)}
                  </span>
                </div>
                <span className="text-center text-[11px] text-slate-500">{item.month}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-end justify-between border-t border-white/5 pt-4">
            <div>
              <p className="text-xs text-slate-500">Ingreso de junio</p>
              <p className="mt-1 text-xl font-bold text-white">{formatPrice(86240)}</p>
            </div>
            <Link to="/admin/finances" className="text-xs font-medium text-brand-400">
              Ver finanzas
            </Link>
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <article className="admin-card p-5 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-white">Rendimiento del equipo</h3>
              <p className="mt-0.5 text-xs text-slate-500">Actividad durante el mes actual</p>
            </div>
            <Link to="/admin/barbers" className="text-xs font-medium text-brand-400">
              Ver equipo
            </Link>
          </div>
          <div className="space-y-4">
            {teamPerformance.map((performance, index) => {
              const barber = barbers.find((item) => item.id === performance.id);
              return (
                <div key={performance.id} className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
                  <div className="relative">
                    <img
                      src={barber?.photo || `/images/barber-${index + 1}.png`}
                      alt={barber?.name || 'Barbero'}
                      className="h-10 w-10 rounded-xl object-cover"
                    />
                    <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[9px] font-bold text-slate-950">
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-white">{barber?.name || 'Cargando...'}</p>
                      <span className="text-xs text-slate-400">{performance.occupancy}% ocupación</span>
                    </div>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
                        style={{ width: `${performance.occupancy}%` }}
                      />
                    </div>
                  </div>
                  <div className="hidden text-right sm:block">
                    <p className="text-sm font-semibold text-white">{formatPrice(performance.revenue)}</p>
                    <p className="text-[11px] text-slate-500">{performance.appointments} citas</p>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="admin-card p-5">
          <h3 className="font-semibold text-white">Atención requerida</h3>
          <p className="mt-0.5 text-xs text-slate-500">Pendientes para mantener el control</p>
          <div className="mt-5 space-y-3">
            <Link to="/admin/appointments" className="flex gap-3 rounded-xl bg-amber-500/5 p-3 hover:bg-amber-500/10">
              <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <div>
                <p className="text-sm font-medium text-slate-200">{pending.length} citas sin confirmar</p>
                <p className="mt-0.5 text-xs text-slate-500">Confirma por WhatsApp o teléfono.</p>
              </div>
            </Link>
            <Link to="/admin/inventory" className="flex gap-3 rounded-xl bg-red-500/5 p-3 hover:bg-red-500/10">
              <Package className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
              <div>
                <p className="text-sm font-medium text-slate-200">{lowStock.length} insumos con stock bajo</p>
                <p className="mt-0.5 text-xs text-slate-500">Pomada, navajas y aceite para barba.</p>
              </div>
            </Link>
            <Link to="/admin/documents" className="flex gap-3 rounded-xl bg-blue-500/5 p-3 hover:bg-blue-500/10">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-blue-400" />
              <div>
                <p className="text-sm font-medium text-slate-200">Póliza próxima a vencer</p>
                <p className="mt-0.5 text-xs text-slate-500">Renovar antes del 30 de junio.</p>
              </div>
            </Link>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 border-t border-white/5 pt-5">
            <Link to="/admin/finances" className="rounded-xl bg-white/[0.03] p-3 text-center hover:bg-white/[0.06]">
              <WalletCards className="mx-auto h-5 w-5 text-brand-400" />
              <p className="mt-2 text-xs text-slate-300">Corte de caja</p>
            </Link>
            <Link to="/admin/customers" className="rounded-xl bg-white/[0.03] p-3 text-center hover:bg-white/[0.06]">
              <CheckCircle2 className="mx-auto h-5 w-5 text-emerald-400" />
              <p className="mt-2 text-xs text-slate-300">Seguimientos</p>
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}
