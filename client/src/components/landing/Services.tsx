import { motion } from 'framer-motion';
import { Scissors, Droplets, Crown, Sparkles, Clock, DollarSign } from 'lucide-react';
import { Card } from '../ui/Card';

const services = [
  {
    icon: Scissors,
    name: 'Classic Haircut',
    description: 'Traditional cut with modern precision. Includes consultation and styling.',
    price: 35,
    duration: '30 min',
  },
  {
    icon: Sparkles,
    name: 'Signature Fade',
    description: 'Precision skin or taper fade with detailed line work and edge-up.',
    price: 45,
    duration: '45 min',
  },
  {
    icon: Droplets,
    name: 'Beard Trim & Shape',
    description: 'Expert beard trimming, shaping, and conditioning with hot towel.',
    price: 25,
    duration: '20 min',
  },
  {
    icon: Crown,
    name: 'Hot Towel Shave',
    description: 'Luxurious straight razor shave with premium cream and aftershave.',
    price: 40,
    duration: '40 min',
  },
  {
    icon: Scissors,
    name: 'Haircut + Beard Combo',
    description: 'Complete grooming: precision haircut combined with beard trim.',
    price: 55,
    duration: '50 min',
  },
  {
    icon: Crown,
    name: 'The Premium Experience',
    description: 'Our signature: haircut, shave, beard grooming, scalp massage, styling.',
    price: 85,
    duration: '1h 15min',
  },
];

export function Services() {
  return (
    <section className="py-24 bg-slate-900/50">
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
            Our Services
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mt-3 mb-4">
            Crafted for the Modern Gentleman
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            From classic cuts to premium grooming experiences, every service is
            delivered with precision and care.
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
