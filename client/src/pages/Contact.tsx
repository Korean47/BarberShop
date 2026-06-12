import { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, MapPin, Phone, Mail, Clock } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import toast from 'react-hot-toast';

export function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Completa todos los campos');
      return;
    }
    setSending(true);
    // Simulate send
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Mensaje enviado en esta demostración');
    setForm({ name: '', email: '', message: '' });
    setSending(false);
  };

  return (
    <div className="section-container py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <span className="text-brand-400 text-sm font-medium tracking-widest uppercase">
          Contacto
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mt-3 mb-4">
          Estamos para atenderte
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto">
          ¿Tienes una pregunta o necesitas un servicio especial? Escríbenos.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-5xl mx-auto">
        {/* Contact form */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-3"
        >
          <div className="glass-card p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Nombre"
                placeholder="Tu nombre"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                label="Correo electrónico"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">
                  Mensaje
                </label>
                <textarea
                  rows={5}
                  placeholder="¿Cómo podemos ayudarte?"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all duration-200 resize-none"
                />
              </div>
              <Button type="submit" loading={sending} className="w-full justify-center">
                <Send className="w-4 h-4" />
                Enviar mensaje
              </Button>
            </form>
          </div>
        </motion.div>

        {/* Info cards */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 space-y-4"
        >
          <Card className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
              <MapPin className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Ubicación</h3>
              <p className="text-sm text-slate-400">Blvd. Morelos 123<br />Hermosillo, Sonora</p>
            </div>
          </Card>

          <Card className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Teléfono</h3>
              <p className="text-sm text-slate-400">(662) 123 4567</p>
            </div>
          </Card>

          <Card className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Correo</h3>
              <p className="text-sm text-slate-400">hola@blades.mx</p>
            </div>
          </Card>

          <Card className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Horario</h3>
              <div className="text-sm text-slate-400 space-y-0.5">
                <p>Lun–Mié: 9:00 – 18:00</p>
                <p>Jue–Vie: 9:00 – 20:00</p>
                <p>Sáb: 9:00 – 17:00</p>
                <p>Dom: Cerrado</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
