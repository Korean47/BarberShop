import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { Clock3, Menu, Scissors, X } from 'lucide-react';
import { useTenant } from '../hooks/useTenant';

const links = [
  { to: '/', label: 'Inicio' },
  { to: '/#services', label: 'Cortes y precios' },
  { to: '/#team', label: 'Barberos' },
  { to: '/contact', label: 'Cómo llegar' },
];

export function MainLayout() {
  const [open, setOpen] = useState(false);
  const { tenant, unavailable } = useTenant();
  const shortName = tenant.name.replace(/\s+Barbería/i, '');

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[#17313a]">
      {unavailable && (
        <div role="status" className="bg-[#b33a25] px-4 py-2 text-center text-sm font-semibold text-white">
          La agenda no está respondiendo. Puedes revisar la información e intentar de nuevo en unos minutos.
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-[#17313a]/10 bg-[#f7f4ed]/95 backdrop-blur-lg">
        <div className="section-container flex h-16 items-center justify-between gap-3 sm:h-[68px]">
          <Link to="/" className="group flex min-w-0 items-center gap-2.5" aria-label={`${tenant.name}, inicio`}>
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[var(--brand)] text-white transition-transform group-hover:-rotate-3">
              <Scissors className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="hidden min-w-0 min-[360px]:block">
              <span className="block truncate text-lg font-black leading-none tracking-tight sm:text-xl">{shortName}</span>
              <span className="mt-1 hidden text-[10px] font-bold uppercase tracking-[0.16em] text-[#587078] min-[360px]:block">Tu barbería del barrio</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-6 lg:flex" aria-label="Navegación principal">
            {links.map((link) => link.to.includes('#') ? (
              <a key={link.to} href={link.to} className="text-sm font-semibold text-[#4f6870] hover:text-[var(--brand)]">{link.label}</a>
            ) : (
              <NavLink key={link.to} to={link.to} className={({ isActive }) => `text-sm font-semibold ${isActive ? 'text-[var(--brand)]' : 'text-[#4f6870] hover:text-[var(--brand)]'}`}>{link.label}</NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Link to="/book" className="inline-flex min-h-11 items-center justify-center whitespace-nowrap rounded-xl bg-[var(--accent)] px-3.5 text-sm font-black text-white shadow-sm transition hover:bg-[#c94725] sm:px-5">
              <span className="min-[430px]:hidden">Agendar</span><span className="hidden min-[430px]:inline">Agendar cita</span>
            </Link>
            <button type="button" className="grid h-11 w-11 place-items-center rounded-xl border border-[#17313a]/15 bg-white lg:hidden" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open} onClick={() => setOpen((value) => !value)}>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open && (
          <nav className="border-t border-[#17313a]/10 bg-[#f7f4ed] px-4 py-3 lg:hidden" aria-label="Navegación móvil">
            <div className="section-container space-y-1 px-0">
              {links.map((link) => <Link key={link.to} to={link.to} onClick={() => setOpen(false)} className="block min-h-12 rounded-xl px-4 py-3 text-base font-bold hover:bg-white">{link.label}</Link>)}
              <Link to="/admin" onClick={() => setOpen(false)} className="block min-h-12 rounded-xl px-4 py-3 text-sm font-semibold text-[#587078] hover:bg-white">Acceso del equipo</Link>
            </div>
          </nav>
        )}
      </header>

      <main><Outlet /></main>

      <footer className="bg-[#17313a] text-white">
        <div className="section-container grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr] lg:py-12">
          <div>
            <div className="flex items-center gap-2 text-xl font-black"><Scissors className="h-5 w-5 text-[var(--brand-soft)]" /> {tenant.name}</div>
            <p className="mt-3 max-w-md text-sm leading-6 text-white/70">Buenos cortes, precios claros y una cita lista en pocos pasos. Así de fácil.</p>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[var(--brand-soft)]">Dónde estamos</p>
            <p className="mt-3 text-sm leading-6 text-white/75">{tenant.locations[0]?.addressLine1 ?? 'Hermosillo, Sonora'}<br />{tenant.locations[0] ? `${tenant.locations[0].city}, ${tenant.locations[0].state}` : ''}</p>
          </div>
          <div>
            <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[var(--brand-soft)]"><Clock3 className="h-4 w-4" /> Horario</p>
            <p className="mt-3 text-sm leading-6 text-white/75">Lun–Vie · 8:00–20:00<br />Sábado · 9:00–17:00</p>
          </div>
        </div>
        <div className="border-t border-white/10 py-5 text-center text-xs text-white/50">© {new Date().getFullYear()} {tenant.name} · Hecho para Hermosillo</div>
      </footer>
    </div>
  );
}
