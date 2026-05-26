import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'David Thompson',
    role: 'Regular Client',
    text: "Best barbershop I've ever been to. Marcus always nails my fade perfectly. The attention to detail is unmatched.",
    rating: 5,
  },
  {
    name: 'James Rodriguez',
    role: 'Client since 2021',
    text: 'The premium experience is worth every penny. Hot towel shave, scalp massage — it\'s pure relaxation. Blades is my go-to.',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Monthly Member',
    text: 'Finally found a barber who understands Asian hair. Diego is incredible with textured styles. Booking is seamless too.',
    rating: 5,
  },
  {
    name: 'Robert Williams',
    role: 'Client since 2019',
    text: "Tony's old-school razor shave is an experience every man should have. The ambiance, the skill, everything is top-notch.",
    rating: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-24 bg-slate-900/50 overflow-hidden">
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
            Testimonials
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mt-3 mb-4">
            What Our Clients Say
          </h2>
        </motion.div>

        {/* Testimonial grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="glass-card p-6 relative"
            >
              <Quote className="absolute top-4 right-4 w-8 h-8 text-brand-500/10" />
              <div className="flex gap-0.5 mb-3">
                {[...Array(t.rating)].map((_, j) => (
                  <Star
                    key={j}
                    className="w-4 h-4 fill-brand-400 text-brand-400"
                  />
                ))}
              </div>
              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                "{t.text}"
              </p>
              <div>
                <div className="text-sm font-semibold text-white">{t.name}</div>
                <div className="text-xs text-slate-500">{t.role}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
