import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Menu, Scissors, X } from 'lucide-react';
import { useTenant } from '../hooks/useTenant';

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/#services', label: 'Servicios' },
  { to: '/contact', label: 'Visítanos' },
];

export function MainLayout() {
  const [open, setOpen] = useState(false);
  const { tenant, unavailable } = useTenant();

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[#17211d]">
      {unavailable && (
        <div role="status" className="bg-[#8c4d3f] px-4 py-2 text-center text-xs font-medium text-white">
          No pudimos conectar con la agenda. Puedes consultar el sitio y volver a intentar en unos minutos.
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-[#17211d]/10 bg-[#f7f3eb]/90 backdrop-blur-xl">
        <div className="section-container flex h-[72px] items-center justify-between">
          <Link to="/" className="group flex items-center gap-3" aria-label={`${tenant.name}, inicio`}>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--brand-dark)] text-[var(--brand-soft)] transition-transform group-hover:-rotate-6">
              <Scissors className="h-5 w-5" aria-hidden="true" />
            </span>
            <span>
              <span className="block font-display text-xl font-semibold leading-none">{tenant.name.replace(' Barbería', '')}</span>
              <span className="mt-1 block text-[9px] font-bold uppercase tracking-[0.24em] text-[#657069]">Barbería de autor</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Navegación principal">
            {links.map((link) => link.to.includes('#') ? (
              <a key={link.to} href={link.to} className="text-sm font-medium text-[#4e5953] transition-colors hover:text-[#17211d]">{link.label}</a>
            ) : (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => `text-sm font-medium transition-colors ${isActive ? 'text-[#17211d]' : 'text-[#4e5953] hover:text-[#17211d]'}`}>
                {link.label}
              </NavLink>
            ))}
          </nav>

          <div className="hidden items-center gap-4 md:flex">
            <Link to="/admin" className="text-xs font-semibold text-[#657069] hover:text-[#17211d]">Acceso equipo</Link>
            <Link to="/book" className="rounded-full bg-[var(--brand-dark)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
              Reservar cita
            </Link>
          </div>

          <button
            type="button"
            className="grid h-11 w-11 place-items-center rounded-full border border-[#17211d]/15 md:hidden"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            onClick={() => setOpen((value) => !value)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {open && (
          <nav className="border-t border-[#17211d]/10 bg-[#f7f3eb] px-4 py-4 md:hidden" aria-label="Navegación móvil">
            <div className="section-container space-y-1 px-0">
              {links.map((link) => (
                <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="block rounded-xl px-4 py-3 text-base font-medium hover:bg-white">{link.label}</Link>
              ))}
              <Link to="/book" onClick={() => setOpen(false)} className="mt-3 block rounded-xl bg-[var(--brand-dark)] px-4 py-3 text-center font-semibold text-white">Reservar cita</Link>
            </div>
          </nav>
        )}
      </header>

      <main><Outlet /></main>

      <footer className="bg-[var(--brand-dark)] text-[#f7f3eb]">
        <div className="section-container grid gap-10 py-14 md:grid-cols-[1.4fr_1fr_1fr]">
          <div>
            <div className="flex items-center gap-3 font-display text-2xl font-semibold">
              <Scissors className="h-5 w-5 text-[var(--brand-soft)]" /> {tenant.name}
            </div>
            <p className="mt-4 max-w-md text-sm leading-6 text-white/60">Cortes precisos, atención puntual y una experiencia pensada para que reservar sea tan fácil como llegar y sentarte.</p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-soft)]">Sucursal</p>
            <p className="mt-4 text-sm leading-6 text-white/70">
              {tenant.locations[0]?.addressLine1 ?? 'Hermosillo, Sonora'}<br />
              {tenant.locations[0] ? `${tenant.locations[0].city}, ${tenant.locations[0].state}` : ''}
            </p>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--brand-soft)]">Contacto</p>
            <p className="mt-4 text-sm leading-6 text-white/70">{tenant.contactPhone ?? 'Atención por cita'}<br />{tenant.contactEmail}</p>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">© {new Date().getFullYear()} {tenant.name}</div>
      </footer>
    </div>
  );
}
