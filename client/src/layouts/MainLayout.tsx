import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { Menu, Scissors, X } from 'lucide-react';
import { useTenant } from '../hooks/useTenant';

const links = [
  { href: '/#services', label: 'Servicios' },
  { href: '/#barbers', label: 'Barberos' },
  { href: '/#location', label: 'Ubicación' },
];

export function MainLayout() {
  const [open, setOpen] = useState(false);
  const { tenant, unavailable } = useTenant();
  const location = useLocation();

  if (location.pathname === '/book') return <main><Outlet /></main>;

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--text)]">
      {unavailable && <div role="status" className="bg-[var(--error)] px-4 py-2 text-center text-sm font-semibold text-white">La agenda no está respondiendo. Intenta nuevamente en unos minutos.</div>}
      <header className="sticky top-0 z-40 border-b border-black/10 bg-[color:var(--background)]/95 backdrop-blur-lg">
        <div className="section-container flex h-16 items-center gap-3 sm:h-[68px]">
          <Link to="/" className="flex min-w-0 items-center gap-2.5" aria-label={`${tenant.name}, inicio`}>
            {tenant.branding?.logoUrl ? <img src={tenant.branding.logoUrl} alt="" className="h-9 w-auto max-w-36 object-contain" /> : <><span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-[var(--primary)] text-white"><Scissors className="h-5 w-5" /></span><span className="truncate font-display text-lg font-semibold tracking-tight sm:text-xl">{tenant.name}</span></>}
          </Link>
          <nav className="ml-auto hidden items-center gap-7 lg:flex" aria-label="Navegación principal">{links.map((link) => <a key={link.href} href={link.href} className="text-sm font-medium text-[var(--muted)] hover:text-[var(--text)]">{link.label}</a>)}</nav>
          <Link to="/appointment" className="ml-auto inline-flex min-h-11 items-center rounded-full border border-[var(--stone)] px-4 text-sm font-semibold hover:border-[var(--primary)] lg:ml-4">Mi cita</Link>
          <button type="button" className="round-control lg:hidden" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open} onClick={() => setOpen((value) => !value)}>{open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        </div>
        {open && <nav className="border-t border-black/10 bg-[var(--background)] px-4 py-3 lg:hidden" aria-label="Navegación móvil"><div className="section-container space-y-1 px-0">{links.map((link) => <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="block min-h-12 rounded-xl px-4 py-3 font-semibold hover:bg-[var(--surface-light)]">{link.label}</a>)}<Link to="/admin" onClick={() => setOpen(false)} className="block min-h-12 rounded-xl px-4 py-3 text-sm text-[var(--muted)] hover:bg-[var(--surface-light)]">Acceso administrativo</Link></div></nav>}
      </header>
      <main><Outlet /></main>
      <footer className="border-t border-white/10 bg-[var(--text)] text-white"><div className="section-container grid gap-8 py-10 sm:grid-cols-2"><div><p className="font-display text-xl font-semibold">{tenant.name}</p><p className="mt-3 max-w-md text-sm leading-6 text-white/65">Servicios, disponibilidad y reservaciones en un solo lugar.</p></div><div className="sm:text-right"><Link to="/appointment" className="text-sm font-semibold underline decoration-white/35 underline-offset-4">Consultar mi cita</Link><p className="mt-3 text-xs text-white/45">© {new Date().getFullYear()} {tenant.name}</p></div></div></footer>
    </div>
  );
}
