import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { CalendarDays, ChevronLeft, CreditCard, LayoutDashboard, LogOut, Menu, Package, Scissors, Settings, Users, WalletCards, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const navigation = [
  { to: '/admin', label: 'Resumen', icon: LayoutDashboard },
  { to: '/admin/appointments', label: 'Citas', icon: CalendarDays },
  { to: '/admin/customers', label: 'Clientes', icon: Users },
  { to: '/admin/barbers', label: 'Barberos', icon: Scissors },
  { to: '/admin/services', label: 'Servicios', icon: Scissors },
  { to: '/admin/finances', label: 'Pagos y caja', icon: WalletCards },
  { to: '/admin/inventory', label: 'Inventario', icon: Package },
  { to: '/admin/settings', label: 'Configuración', icon: Settings },
  { to: '/admin/billing', label: 'Suscripción', icon: CreditCard },
];

const pageNames: Record<string, string> = {
  '/admin': 'Resumen de hoy', '/admin/appointments': 'Citas', '/admin/customers': 'Clientes', '/admin/finances': 'Pagos y caja', '/admin/barbers': 'Barberos', '/admin/services': 'Servicios', '/admin/inventory': 'Inventario', '/admin/documents': 'Documentos', '/admin/settings': 'Configuración', '/admin/billing': 'Suscripción',
};

export function AdminLayout() {
  const { session, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isActive = (path: string) => path === '/admin' ? location.pathname === path : location.pathname.startsWith(path);

  const navContent = (mobile = false) => (
    <>
      <div className="flex h-[68px] items-center border-b border-white/10 px-3">
        <Link to="/" className="flex items-center gap-3" onClick={() => mobile && setMobileOpen(false)}>
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-[#f2c14e] text-[#17313a]"><Scissors className="h-5 w-5" /></div>
          {(!collapsed || mobile) && <div><p className="text-base font-black text-white">Blades</p><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/55">Administración</p></div>}
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return <Link key={item.to} to={item.to} onClick={() => mobile && setMobileOpen(false)} title={collapsed && !mobile ? item.label : undefined} className={`group flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-bold transition ${active ? 'bg-white text-[#0f4c5c] shadow-sm' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}><Icon className="h-5 w-5 shrink-0" />{(!collapsed || mobile) && item.label}</Link>;
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        {(!collapsed || mobile) && <div className="mb-2 flex items-center gap-3 rounded-xl bg-white/10 p-3"><div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[#f2c14e] text-xs font-black text-[#17313a]">{session?.user.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}</div><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-white">{session?.user.name}</p><p className="text-[10px] text-white/55">Administrador</p></div><button type="button" onClick={() => void logout()} className="grid h-9 w-9 place-items-center rounded-lg text-white/65 hover:bg-white/10 hover:text-white" aria-label="Cerrar sesión"><LogOut className="h-4 w-4" /></button></div>}
        {!mobile && <button type="button" onClick={() => setCollapsed((value) => !value)} className="flex h-10 w-full items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white" title={collapsed ? 'Expandir menú' : 'Contraer menú'}><ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} /></button>}
      </div>
    </>
  );

  return (
    <div className="admin-shell flex min-h-screen bg-[#f4f7f7] text-slate-900">
      <aside className={`hidden shrink-0 flex-col bg-[#0f4c5c] transition-[width] duration-200 lg:flex ${collapsed ? 'w-[72px]' : 'w-60'}`}>{navContent()}</aside>
      {mobileOpen && <div className="fixed inset-0 z-50 bg-[#17313a]/55 lg:hidden" onClick={() => setMobileOpen(false)}><aside className="relative flex h-full w-[min(84vw,300px)] flex-col bg-[#0f4c5c] pb-[env(safe-area-inset-bottom)]" onClick={(event) => event.stopPropagation()}><button type="button" onClick={() => setMobileOpen(false)} className="absolute right-3 top-3 z-10 grid h-10 w-10 place-items-center rounded-xl text-white hover:bg-white/10" aria-label="Cerrar menú"><X className="h-5 w-5" /></button>{navContent(true)}</aside></div>}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-[68px] items-center border-b border-slate-200 bg-white/95 px-4 backdrop-blur lg:px-7">
          <button type="button" onClick={() => setMobileOpen(true)} className="mr-3 grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-700 lg:hidden" aria-label="Abrir menú"><Menu className="h-5 w-5" /></button>
          <div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">Panel de la barbería</p><h1 className="truncate text-base font-black text-slate-900">{pageNames[location.pathname] || 'Administración'}</h1></div>
          <div className="ml-auto flex items-center gap-2"><span className="hidden rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 sm:block">Abierto hoy</span><Link to="/" className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 hover:bg-slate-50">Ver sitio</Link></div>
        </header>
        {session?.tenant?.subscriptionStatus && !['ACTIVE', 'TRIAL', 'GRACE'].includes(session.tenant.subscriptionStatus) && <div className="border-b border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 lg:px-7">La operación está pausada por facturación. Reactiva el servicio desde <Link to="/admin/billing" className="font-black underline">Suscripción</Link>.</div>}
        <main className="p-4 sm:p-5 lg:p-7"><Outlet /></main>
      </div>
    </div>
  );
}
