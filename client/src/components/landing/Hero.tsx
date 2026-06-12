import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarCheck2, Clock3, ShieldCheck, Star } from 'lucide-react';
import { Button } from '../ui/Button';
import heroImage from '../../assets/barbershop-hero.png';

export function Hero() {
  return (
    <section className="relative min-h-[calc(100vh-4rem)] overflow-hidden">
      <img
        src={heroImage}
        alt="Barbero profesional realizando un corte"
        className="absolute inset-0 h-full w-full object-cover object-[68%_center]"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-slate-950/20" />

      <div className="section-container relative z-10 flex min-h-[calc(100vh-4rem)] items-center py-20">
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1.5 backdrop-blur-md"
          >
            <div className="flex">
              {Array.from({ length: 5 }, (_, index) => (
                <Star key={index} className="h-3.5 w-3.5 fill-brand-400 text-brand-400" />
              ))}
            </div>
            <span className="text-xs text-slate-200">4.9 de calificación por nuestros clientes</span>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-4 text-sm font-semibold uppercase tracking-[0.26em] text-brand-400"
          >
            Barbería premium en Hermosillo
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-display text-5xl font-bold leading-[1.05] text-white sm:text-6xl lg:text-7xl"
          >
            Tu estilo merece
            <span className="block text-gradient">su propio ritual.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg"
          >
            Reserva en minutos, elige a tu barbero y llega directo a disfrutar una experiencia
            cuidada hasta el último detalle.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-9 flex flex-wrap gap-3"
          >
            <Link to="/book">
              <Button size="lg">
                Agendar mi cita
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <a href="#services">
              <Button variant="secondary" size="lg">Ver servicios</Button>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 grid max-w-xl grid-cols-3 gap-3 border-t border-white/10 pt-6"
          >
            {[
              { icon: CalendarCheck2, value: 'En línea', label: 'Reserva 24/7' },
              { icon: Clock3, value: 'A tiempo', label: 'Sin largas esperas' },
              { icon: ShieldCheck, value: 'Profesional', label: 'Servicio garantizado' },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex gap-2">
                  <Icon className="mt-0.5 hidden h-4 w-4 text-brand-400 sm:block" />
                  <div>
                    <p className="text-sm font-semibold text-white">{item.value}</p>
                    <p className="mt-0.5 text-[10px] text-slate-500 sm:text-xs">{item.label}</p>
                  </div>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
