import { motion } from 'framer-motion';
import { Scissors, Droplets, Crown, Sparkles, Clock, DollarSign } from 'lucide-react';
import { Card } from '../ui/Card';

const services = [
  {
    icon: Scissors,
    name: 'Corte clásico',
    description: 'Corte tradicional con precisión moderna. Incluye asesoría y peinado.',
    price: 350,
    duration: '30 min',
  },
  {
    icon: Sparkles,
    name: 'Fade signature',
    description: 'Desvanecido de precisión con contornos limpios y acabado detallado.',
    price: 450,
    duration: '45 min',
  },
  {
    icon: Droplets,
    name: 'Perfilado de barba',
    description: 'Recorte, diseño y acondicionamiento de barba con toalla caliente.',
    price: 280,
    duration: '20 min',
  },
  {
    icon: Crown,
    name: 'Afeitado tradicional',
    description: 'Afeitado con navaja, toalla caliente y productos de cuidado premium.',
    price: 380,
    duration: '40 min',
  },
  {
    icon: Scissors,
    name: 'Corte + barba',
    description: 'Servicio completo con corte de precisión y diseño profesional de barba.',
    price: 550,
    duration: '50 min',
  },
  {
    icon: Crown,
    name: 'Experiencia premium',
    description: 'Corte, afeitado, cuidado de barba, masaje capilar y peinado final.',
    price: 850,
    duration: '1h 15min',
  },
];

export function Services() {
  return (
    <section id="services" className="py-24 bg-slate-900/50">
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
            Nuestros servicios
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mt-3 mb-4">
            Precisión, cuidado y estilo
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Desde un corte clásico hasta una experiencia completa, cada servicio
            está pensado para que salgas sintiéndote mejor.
          </p>
        </motion.div>

        {/* Service grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => {
            const Icon = service.icon;
            return (
              <motion.div
                key={service.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Card hover className="h-full">
                  <div className="w-12 h-12 rounded-xl bg-brand-500/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-brand-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {service.name}
                  </h3>
                  <p className="text-sm text-slate-400 mb-4 leading-relaxed">
                    {service.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1 text-brand-400 font-semibold">
                      <DollarSign className="w-3.5 h-3.5" />
                      {service.price}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500">
                      <Clock className="w-3.5 h-3.5" />
                      {service.duration}
                    </span>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
