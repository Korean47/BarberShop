import { useEffect, useState } from 'react';
import { CalendarClock, Mail, MoreHorizontal, Plus, Star, TrendingUp } from 'lucide-react';
import toast from 'react-hot-toast';
import { getBarbers } from '../services/api';
import { AdminPageHeader } from '../components/admin/AdminPageHeader';
import { Button } from '../components/ui/Button';
import { teamPerformance } from '../data/adminDemo';
import { formatPrice, parseSpecialties, parseWorkSchedule } from '../utils/helpers';
import type { Barber } from '../types';

export function AdminBarbers() {
  const [barbers, setBarbers] = useState<Barber[]>([]);

  useEffect(() => {
    let active = true;
    getBarbers()
      .then((items) => {
        if (active) setBarbers(items);
      })
      .catch(console.error);
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-7">
      <AdminPageHeader
        eyebrow="Equipo y productividad"
        title="Barberos"
        description="Consulta horarios, carga de trabajo y desempeño individual para equilibrar mejor la agenda."
        action={
          <Button onClick={() => toast.success('Formulario de colaborador preparado')}>
            <Plus className="h-4 w-4" />
            Agregar barbero
          </Button>
        }
      />

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {barbers.map((barber, index) => {
          const performance = teamPerformance.find((item) => item.id === barber.id) || teamPerformance[index];
          const schedule = parseWorkSchedule(barber.workSchedule);
          const workingDays = Object.keys(schedule).length;
          return (
            <article key={barber.id} className="admin-card overflow-hidden">
              <div className="relative h-24 bg-gradient-to-br from-brand-500/20 via-slate-800 to-slate-900">
                <button className="absolute right-3 top-3 rounded-lg bg-slate-950/40 p-1.5 text-slate-400 hover:text-white">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
              <div className="-mt-10 p-5 pt-0">
                <img
                  src={barber.photo}
                  alt={barber.name}
                  className="h-20 w-20 rounded-2xl border-4 border-slate-900 object-cover"
                />
                <div className="mt-3 flex items-start justify-between gap-2">
                  <div>
                    <h3 className="font-semibold text-white">{barber.name}</h3>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                      <Mail className="h-3 w-3" /> {barber.email}
                    </p>
                  </div>
                  <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-[10px] font-medium text-emerald-400">
                    Activo
                  </span>
                </div>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {parseSpecialties(barber.specialties).slice(0, 2).map((specialty) => (
                    <span key={specialty} className="rounded-md bg-white/5 px-2 py-1 text-[10px] text-slate-400">
                      {specialty}
                    </span>
                  ))}
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3 border-y border-white/5 py-4">
                  <div>
                    <p className="text-lg font-bold text-white">{performance?.appointments || 0}</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Citas</p>
                  </div>
                  <div>
                    <p className="text-lg font-bold text-brand-400">{formatPrice(performance?.revenue || 0)}</p>
                    <p className="text-[10px] uppercase tracking-wider text-slate-500">Generado</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2 text-xs text-slate-400">
                  <p className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Star className="h-3.5 w-3.5 text-brand-400" /> Calificación</span>
                    <span className="font-medium text-white">{performance?.rating || '-'}</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><CalendarClock className="h-3.5 w-3.5 text-blue-400" /> Días activos</span>
                    <span className="font-medium text-white">{workingDays} por semana</span>
                  </p>
                  <p className="flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><TrendingUp className="h-3.5 w-3.5 text-emerald-400" /> Ocupación</span>
                    <span className="font-medium text-white">{performance?.occupancy || 0}%</span>
                  </p>
                </div>
                <Button
                  variant="ghost"
                  className="mt-4 w-full border border-white/5"
                  onClick={() => toast.success(`Abriendo agenda de ${barber.name}`)}
                >
                  Ver agenda y horario
                </Button>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
