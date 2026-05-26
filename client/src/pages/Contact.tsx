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
      toast.error('Please fill in all fields');
      return;
    }
    setSending(true);
    // Simulate send
    await new Promise((r) => setTimeout(r, 1000));
    toast.success('Message sent! (Note: This is a demo app, no actual email was sent.)');
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
          Contact
        </span>
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-white mt-3 mb-4">
          Get in Touch
        </h1>
        <p className="text-slate-400 max-w-lg mx-auto">
          Have a question or want to book a custom session? Drop us a message.
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
                label="Name"
                placeholder="Your name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <Input
                label="Email"
                type="email"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-300">
                  Message
                </label>
                <textarea
                  rows={5}
                  placeholder="How can we help?"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500 transition-all duration-200 resize-none"
                />
              </div>
              <Button type="submit" loading={sending} className="w-full justify-center">
                <Send className="w-4 h-4" />
                Send Message
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
              <h3 className="text-sm font-semibold text-white mb-1">Location</h3>
              <p className="text-sm text-slate-400">123 Barber Street<br />Downtown, NY 10001</p>
            </div>
          </Card>

          <Card className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
              <Phone className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Phone</h3>
              <p className="text-sm text-slate-400">(555) 123-4567</p>
            </div>
          </Card>

          <Card className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Email</h3>
              <p className="text-sm text-slate-400">hello@blades.com</p>
            </div>
          </Card>

          <Card className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center flex-shrink-0">
              <Clock className="w-5 h-5 text-brand-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-white mb-1">Hours</h3>
              <div className="text-sm text-slate-400 space-y-0.5">
                <p>Mon–Wed: 9am – 6pm</p>
                <p>Thu–Fri: 9am – 8pm</p>
                <p>Sat: 9am – 5pm</p>
                <p>Sun: Closed</p>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
