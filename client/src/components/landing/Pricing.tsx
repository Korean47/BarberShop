import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '../ui/Button';

const plans = [
  {
    name: 'Classic Cut',
    price: 35,
    description: 'Perfect for a quick, clean haircut.',
    features: ['Consultation', 'Precision haircut', 'Shampoo & style', 'Neck cleanup'],
    popular: false,
  },
  {
    name: 'Haircut + Beard',
    price: 55,
    description: 'The complete grooming package.',
    features: [
      'Consultation',
      'Precision haircut',
      'Beard trim & shape',
      'Hot towel treatment',
      'Shampoo & style',
      'Product finish',
    ],
    popular: true,
  },
  {
    name: 'Premium Experience',
    price: 85,
    description: 'Our ultimate grooming ritual.',
    features: [
      'Full consultation',
      'Signature haircut',
      'Hot towel shave',
      'Beard grooming',
      'Scalp massage',
      'Premium products',
      'Complimentary drink',
    ],
    popular: false,
  },
];

export function Pricing() {
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
            Pricing
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mt-3 mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Choose the service that fits your style. No hidden fees.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`
                rounded-2xl p-6 border transition-all duration-300
                ${
                  plan.popular
                    ? 'bg-gradient-to-b from-brand-500/10 to-transparent border-brand-500/30 ring-1 ring-brand-500/20 scale-[1.02]'
                    : 'glass-card'
                }
              `}
            >
              {plan.popular && (
                <span className="inline-block text-xs font-medium text-brand-400 bg-brand-500/10 px-2.5 py-1 rounded-full mb-4">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <p className="text-sm text-slate-400 mt-1 mb-4">{plan.description}</p>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-4xl font-bold text-white">${plan.price}</span>
                <span className="text-sm text-slate-500">/visit</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link to="/book">
                <Button
                  variant={plan.popular ? 'primary' : 'outline'}
                  className="w-full justify-center"
                >
                  Book Now
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
