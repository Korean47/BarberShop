import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, MapPin } from 'lucide-react';
import { getBarber } from '../services/api';
import { parseSpecialties, parseWorkSchedule, capitalize } from '../utils/helpers';
import { Button } from '../components/ui/Button';
import { PageSpinner } from '../components/ui/Spinner';
import type { Barber } from '../types';

export function BarberDetails() {
  const { id } = useParams<{ id: string }>();
  const [barber, setBarber] = useState<Barber | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getBarber(id)
      .then(setBarber)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <PageSpinner />;
  if (!barber) {
    return (
      <div className="section-container py-20 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Barber not found</h2>
        <Link to="/">
          <Button variant="outline">Back to Home</Button>
        </Link>
      </div>
    );
  }

  const specialties = parseSpecialties(barber.specialties);
  const schedule = parseWorkSchedule(barber.workSchedule);
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  return (
    <div className="section-container py-12">
      {/* Back link */}
      <Link
        to="/"
        className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white mb-8 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Home
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* Photo & quick info */}
        <div className="lg:col-span-1">
          <div className="glass-card p-6 text-center">
            <div className="w-40 h-40 mx-auto rounded-full overflow-hidden ring-4 ring-brand-500/20 mb-6">
              <img
                src={barber.photo}
                alt={barber.name}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-2xl font-display font-bold text-white mb-2">
              {barber.name}
            </h1>
            <div className="flex flex-wrap justify-center gap-2 mb-4">
              {specialties.map((s) => (
                <span
                  key={s}
                  className="text-xs px-2.5 py-1 rounded-full bg-brand-500/10 text-brand-400 border border-brand-500/20"
                >
                  {s}
                </span>
              ))}
            </div>
            <Link to={`/book?barber=${barber.id}`}>
              <Button className="w-full justify-center mt-2">
                Book with {barber.name.split(' ')[0]}
              </Button>
            </Link>
          </div>
        </div>

        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bio */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-3">About</h2>
            <p className="text-slate-300 leading-relaxed">{barber.bio}</p>
          </div>

          {/* Schedule */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-400" />
              Work Schedule
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {days.map((day) => {
                const hours = schedule[day];
                return (
                  <div
                    key={day}
                    className={`flex items-center justify-between px-4 py-2.5 rounded-xl ${
                      hours ? 'bg-slate-800/50' : 'bg-slate-800/20'
                    }`}
                  >
                    <span className="text-sm font-medium text-slate-300">
                      {capitalize(day)}
                    </span>
                    <span className={`text-sm ${hours ? 'text-brand-400' : 'text-slate-600'}`}>
                      {hours ? `${hours.start} – ${hours.end}` : 'Day Off'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-brand-400" />
              Contact
            </h2>
            <div className="space-y-2 text-sm text-slate-400">
              <p>Email: {barber.email}</p>
              <p>Phone: {barber.phone}</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
