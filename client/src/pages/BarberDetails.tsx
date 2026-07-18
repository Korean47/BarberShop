import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Clock3 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { getBarber } from '../services/api';
import type { Barber } from '../types';
import { capitalize, parseSpecialties, parseWorkSchedule } from '../utils/helpers';
import { PageSpinner } from '../components/ui/Spinner';

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const dayLabels: Record<string, string> = { monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles', thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo' };

export function BarberDetails() {
  const { id = '' } = useParams();
  const [barber, setBarber] = useState<Barber | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { getBarber(id).then(setBarber).catch(() => setBarber(null)).finally(() => setLoading(false)); }, [id]);
  if (loading) return <PageSpinner />;
  if (!barber) return <div className="section-container py-24 text-center"><h1 className="text-4xl font-black">Barbero no encontrado</h1><Link to="/" className="mt-5 inline-block font-bold underline">Volver al inicio</Link></div>;
  const specialties = parseSpecialties(barber.specialties);
  const schedule = parseWorkSchedule(barber.workSchedule);
  return (
    <div className="section-container py-10 sm:py-16">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-[#587078] hover:text-[var(--brand)]"><ArrowLeft className="h-4 w-4" /> Volver</Link>
      <div className="mt-6 grid overflow-hidden rounded-2xl border border-[#17313a]/10 bg-white shadow-md lg:grid-cols-[.85fr_1.15fr]">
        <div className="bg-[#dcecef]"><img src={barber.photo} alt={`Retrato de ${barber.name}`} className="aspect-square h-full w-full object-cover lg:aspect-auto lg:min-h-[420px]" /></div>
        <div className="p-7 sm:p-10 lg:p-12">
          <p className="text-xs font-black uppercase tracking-wider text-[var(--accent)]">Conoce a tu barbero</p>
          <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">{barber.name}</h1>
          <div className="mt-4 flex flex-wrap gap-2">{specialties.map((specialty) => <span key={specialty} className="rounded-lg bg-[#eaf4f5] px-3 py-1.5 text-xs font-bold text-[var(--brand)]">{specialty}</span>)}</div>
          <p className="mt-6 text-base leading-7 text-[#587078]">{barber.bio}</p>
          <Link to={`/book?barber=${barber.id}`} className="mt-7 inline-flex min-h-[52px] items-center gap-2 rounded-xl bg-[var(--accent)] px-6 font-black text-white">Agendar con {barber.name.split(' ')[0]} <ArrowRight className="h-4 w-4" /></Link>
          <div className="mt-10 border-t border-[#17211d]/10 pt-7">
            <h2 className="flex items-center gap-2 font-bold"><Clock3 className="h-4 w-4 text-[var(--brand)]" /> Horario habitual</h2>
            <div className="mt-4 grid gap-x-8 gap-y-2 sm:grid-cols-2">{days.map((day) => <div key={day} className="flex justify-between border-b border-[#17211d]/5 py-2 text-sm"><span>{dayLabels[day] ?? capitalize(day)}</span><span className="text-[#657069]">{schedule[day] ? `${schedule[day].start} – ${schedule[day].end}` : 'Descanso'}</span></div>)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
