import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CalendarDays, CheckCircle2, Clock3, DollarSign, Package, TriangleAlert, Users } from 'lucide-react';
import { getAppointments } from '../services/api';
import { inventoryItems } from '../data/adminDemo';
import { formatPrice, formatTime } from '../utils/helpers';
import { Badge } from '../components/ui/Badge';
import type { Appointment } from '../types';

const todayKey = new Date().toISOString().slice(0, 10);
const todayLabel = new Intl.DateTimeFormat('es-MX', { weekday: 'long' }).format(new Date());

export function AdminDashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { let active = true; getAppointments().then((items) => active && setAppointments(items)).catch(console.error).finally(() => active && setLoading(false)); return () => { active = false; }; }, []);
  const today = useMemo(() => appointments.filter((item) => item.date.slice(0, 10) === todayKey && item.status !== 'cancelled').sort((a, b) => a.startTime.localeCompare(b.startTime)), [appointments]);
  const completed = today.filter((item) => item.status === 'completed').length;
  const pending = today.filter((item) => item.status === 'pending').length;
  const income = today.reduce((sum, item) => sum + item.service.price, 0);
  const lowStock = inventoryItems.filter((item) => item.stock <= item.minimum);
  const stats = [
    { label: 'Citas de hoy', value: today.length, detail: `${completed} terminadas`, icon: CalendarDays, tone: 'bg-blue-50 text-blue-700' },
    { label: 'Por confirmar', value: pending, detail: 'Revisar antes del servicio', icon: Clock3, tone: 'bg-amber-50 text-amber-700' },
    { label: 'Ingreso del día', value: formatPrice(income), detail: 'Servicios programados', icon: DollarSign, tone: 'bg-emerald-50 text-emerald-700' },
    { label: 'Stock bajo', value: lowStock.length, detail: 'Insumos por reponer', icon: Package, tone: 'bg-red-50 text-red-700' },
  ];

  return (
    <div className="space-y-5">
      <section className="flex flex-col gap-4 rounded-2xl border border-[#0f4c5c]/15 bg-[#eaf4f5] p-5 sm:flex-row sm:items-center sm:justify-between lg:p-6">
        <div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#0f4c5c]">{todayLabel} · Operación del día</p><h2 className="mt-1 text-2xl font-black tracking-tight text-slate-900">Buenos días, Alejandro</h2><p className="mt-2 text-sm text-slate-600">Tienes {today.length} {today.length === 1 ? 'cita' : 'citas'} y {pending} {pending === 1 ? 'pendiente' : 'pendientes'} por confirmar.</p></div>
        <div className="flex gap-2"><Link to="/book" className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-xl border border-[#0f4c5c]/20 bg-white px-4 text-sm font-black text-[#0f4c5c]"><span className="min-[360px]:hidden">Nueva</span><span className="hidden min-[360px]:inline">Nueva cita</span></Link><Link to="/admin/appointments" className="inline-flex min-h-11 items-center justify-center gap-2 whitespace-nowrap rounded-xl bg-[#0f4c5c] px-4 text-sm font-black text-white"><span className="min-[360px]:hidden">Agenda</span><span className="hidden min-[360px]:inline">Abrir agenda</span> <ArrowRight className="h-4 w-4" /></Link></div>
      </section>

      <section className="grid grid-cols-2 gap-3 xl:grid-cols-4">{stats.map((stat) => { const Icon = stat.icon; return <article key={stat.label} className="admin-card min-w-0 p-4 sm:p-5"><div className={`grid h-10 w-10 place-items-center rounded-xl ${stat.tone}`}><Icon className="h-5 w-5" /></div><p className="mt-3 text-xs font-bold text-slate-500 sm:text-sm">{stat.label}</p><p className="mt-1 truncate text-xl font-black text-slate-900 sm:text-2xl">{loading ? '…' : stat.value}</p><p className="mt-2 hidden text-xs text-slate-500 sm:block">{stat.detail}</p></article>; })}</section>

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1.55fr)_minmax(280px,.7fr)]">
        <article className="admin-card overflow-hidden"><div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 sm:px-5"><div><h3 className="font-black text-slate-900">Próximas citas</h3><p className="mt-0.5 text-xs text-slate-500">Lo que sigue hoy</p></div><Link to="/admin/appointments" className="text-xs font-black text-[#0f4c5c]">Ver todas</Link></div><div className="divide-y divide-slate-100">{today.slice(0, 6).map((appointment) => <div key={appointment.id} className="grid grid-cols-[58px_40px_minmax(0,1fr)] items-center gap-3 px-4 py-3 sm:grid-cols-[64px_44px_minmax(0,1fr)_auto] sm:px-5"><div><p className="text-sm font-black text-slate-900">{formatTime(appointment.startTime)}</p><p className="text-[10px] text-slate-500">{appointment.service.duration} min</p></div><img src={appointment.barber.photo} alt="" className="h-10 w-10 rounded-xl object-cover sm:h-11 sm:w-11" /><div className="min-w-0"><p className="truncate text-sm font-bold text-slate-900">{appointment.customer.name}</p><p className="truncate text-xs text-slate-500">{appointment.service.name} · {appointment.barber.name}</p></div><div className="hidden text-right sm:block"><p className="mb-1 text-sm font-black text-[#0f4c5c]">{formatPrice(appointment.service.price)}</p><Badge status={appointment.status} /></div></div>)}{!loading && today.length === 0 && <div className="px-5 py-12 text-center"><CheckCircle2 className="mx-auto h-9 w-9 text-emerald-600" /><p className="mt-3 font-bold text-slate-700">No hay citas para hoy.</p></div>}</div></article>

        <article className="admin-card p-5"><h3 className="font-black text-slate-900">Atención requerida</h3><p className="mt-1 text-xs text-slate-500">Pendientes importantes</p><div className="mt-4 space-y-3"><Link to="/admin/appointments" className="flex gap-3 rounded-xl bg-amber-50 p-3.5 hover:bg-amber-100"><Clock3 className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" /><div><p className="text-sm font-bold text-amber-950">{pending} citas sin confirmar</p><p className="mt-1 text-xs text-amber-800">Confirma por llamada o mensaje.</p></div></Link><Link to="/admin/inventory" className="flex gap-3 rounded-xl bg-red-50 p-3.5 hover:bg-red-100"><TriangleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-700" /><div><p className="text-sm font-bold text-red-950">{lowStock.length} insumos con stock bajo</p><p className="mt-1 text-xs text-red-800">Revisa antes de terminar el día.</p></div></Link><Link to="/admin/customers" className="flex gap-3 rounded-xl bg-blue-50 p-3.5 hover:bg-blue-100"><Users className="mt-0.5 h-5 w-5 shrink-0 text-blue-700" /><div><p className="text-sm font-bold text-blue-950">Seguimiento de clientes</p><p className="mt-1 text-xs text-blue-800">Consulta historial y contacto.</p></div></Link></div></article>
      </section>
    </div>
  );
}
