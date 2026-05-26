import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Card } from '../ui/Card';
import { parseSpecialties } from '../../utils/helpers';
import type { Barber } from '../../types';

interface TeamProps {
  barbers: Barber[];
}

export function Team({ barbers }: TeamProps) {
  return (
    <section className="py-24">
      <div className="section-container">
        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-brand-400 text-sm font-medium tracking-widest uppercase">
            The Team
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mt-3 mb-4">
            Meet Our Expert Barbers
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Our team of skilled professionals brings years of experience and passion
            to every appointment.
          </p>
        </motion.div>

        {/* Barber cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {barbers.map((barber, i) => {
            const specialties = parseSpecialties(barber.specialties);
            return (
              <motion.div
                key={barber.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link to={`/barbers/${barber.id}`}>
                  <Card hover className="text-center group">
                    {/* Photo */}
                    <div className="w-28 h-28 mx-auto mb-4 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-brand-500/50 transition-all">
                      <img
                        src={barber.photo}
                        alt={barber.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    {/* Info */}
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {barber.name}
                    </h3>
                    <div className="flex flex-wrap justify-center gap-1.5 mb-3">
                      {specialties.slice(0, 2).map((s) => (
                        <span
                          key={s}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-brand-500/10 text-brand-400"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                      {barber.bio}
                    </p>
                    <span className="inline-flex items-center gap-1 text-xs text-brand-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      View Profile <ArrowRight className="w-3 h-3" />
                    </span>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
