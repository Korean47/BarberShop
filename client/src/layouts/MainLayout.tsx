import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Scissors, Menu, X } from 'lucide-react';
import { Button } from '../components/ui/Button';

const navLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/book', label: 'Agendar' },
  { to: '/contact', label: 'Contacto' },
];

export function MainLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-lg border-b border-white/5">
        <div className="section-container">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                <Scissors className="w-5 h-5 text-white" />
              </div>
              <span className="font-display text-xl font-semibold text-white">
                Blades
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`
                    px-4 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      location.pathname === link.to
                        ? 'text-brand-400 bg-brand-500/10'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop CTA */}
            <div className="hidden md:flex items-center gap-3">
              <Link to="/admin">
                <Button variant="ghost" size="sm">
                  Panel
                </Button>
              </Link>
              <Link to="/book">
                <Button size="sm">Agendar cita</Button>
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/5 bg-slate-900/95 backdrop-blur-lg">
            <div className="section-container py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`
                    block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${
                      location.pathname === link.to
                        ? 'text-brand-400 bg-brand-500/10'
                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                    }
                  `}
                >
                  {link.label}
                </Link>
              ))}
              <div className="pt-3 border-t border-white/5 space-y-2">
                <Link to="/admin" onClick={() => setMobileOpen(false)}>
                  <Button variant="ghost" size="sm" className="w-full justify-center">
                    Panel administrativo
                  </Button>
                </Link>
                <Link to="/book" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="w-full justify-center">
                    Agendar cita
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Page content */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-slate-900/50">
        <div className="section-container py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                  <Scissors className="w-4 h-4 text-white" />
                </div>
                <span className="font-display text-lg font-semibold text-white">
                  Blades
                </span>
              </div>
              <p className="text-sm text-slate-400 max-w-sm">
                Una experiencia de barbería para quienes valoran el detalle,
                la puntualidad y un servicio realmente personal.
              </p>
            </div>

            {/* Hours */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Horario</h4>
              <ul className="space-y-1.5 text-sm text-slate-400">
                <li>Lun – Mié: 9:00 – 18:00</li>
                <li>Jue – Vie: 9:00 – 20:00</li>
                <li>Sábado: 9:00 – 17:00</li>
                <li>Domingo: Cerrado</li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-white mb-3">Contacto</h4>
              <ul className="space-y-1.5 text-sm text-slate-400">
                <li>Blvd. Morelos 123</li>
                <li>Hermosillo, Sonora</li>
                <li>(662) 123 4567</li>
                <li>hola@blades.mx</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/5 text-center text-xs text-slate-500">
            © {new Date().getFullYear()} Blades Barbería. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}
