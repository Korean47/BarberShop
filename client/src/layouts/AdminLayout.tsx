import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  CalendarDays,
  ChevronLeft,
  FileText,
  LayoutDashboard,
  Menu,
  Package,
  Scissors,
  Settings,
  Users,
  WalletCards,
  X,
} from 'lucide-react';

const navigation = [
  { to: '/admin', label: 'Resumen', icon: LayoutDashboard },
  { to: '/admin/appointments', label: 'Agenda', icon: CalendarDays },
  { to: '/admin/customers', label: 'Clientes', icon: Users },
  { to: '/admin/finances', label: 'Finanzas', icon: WalletCards },
  { to: '/admin/barbers', label: 'Barberos', icon: Scissors },
  { to: '/admin/inventory', label: 'Inventario', icon: Package },
  { to: '/admin/documents', label: 'Documentos', icon: FileText },
  { to: '/admin/settings', label: 'Configuración', icon: Settings },
];

const pageNames: Record<string, string> = {
  '/admin': 'Resumen',
  '/admin/appointments': 'Agenda y citas',
  '/admin/customers': 'Clientes',
  '/admin/finances': 'Finanzas',
  '/admin/barbers': 'Equipo',
  '/admin/inventory': 'Inventario',
  '/admin/documents': 'Documentos',
  '/admin/settings': 'Configuración',
};

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) =>
    path === '/admin' ? location.pathname === path : location.pathname.startsWith(path);

  const navContent = (mobile = false) => (
    <>
      <div className="flex h-20 items-center border-b border-white/5 px-4">
        <Link to="/" className="flex items-center gap-3" onClick={() => mobile && setMobileOpen(false)}>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 shadow-lg shadow-brand-500/20">
            <Scissors className="h-5 w-5 text-slate-950" />
          </div>
          {(!collapsed || mobile) && (
            <div>
              <p className="font-display text-lg font-semibold text-white">Blades</p>
              <p className="text-[10px] uppercase tracking-[0.2em] text-brand-400">Administración</p>
            </div>
          )}
        </Link>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-5">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => mobile && setMobileOpen(false)}
              title={collapsed && !mobile ? item.label : undefined}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-brand-500/10 text-brand-400'
                  : 'text-slate-500 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              <Icon className={`h-5 w-5 shrink-0 ${active ? 'text-brand-400' : 'group-hover:text-slate-300'}`} />
              {(!collapsed || mobile) && item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/5 p-3">
        {(!collapsed || mobile) && (
          <div className="mb-3 flex items-center gap-3 rounded-xl bg-white/[0.03] p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/15 text-xs font-bold text-brand-400">
              AR
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-white">Alejandro Ruiz</p>
              <p className="text-[10px] text-slate-500">Administrador</p>
            </div>
          </div>
        )}
        {!mobile && (
          <button
            onClick={() => setCollapsed((value) => !value)}
            className="flex w-full items-center justify-center rounded-lg p-2 text-slate-600 hover:bg-white/5 hover:text-white"
            title={collapsed ? 'Expandir menú' : 'Contraer menú'}
          >
            <ChevronLeft className={`h-4 w-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
          </button>
        )}
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-[#0a101c]">
      <aside className={`hidden shrink-0 flex-col border-r border-white/5 bg-[#0c1322] transition-[width] duration-300 lg:flex ${collapsed ? 'w-[72px]' : 'w-64'}`}>
        {navContent()}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)}>
          <aside className="flex h-full w-72 flex-col bg-[#0c1322]" onClick={(event) => event.stopPropagation()}>
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
            {navContent(true)}
          </aside>
        </div>
      )}

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-30 flex h-20 items-center border-b border-white/5 bg-[#0a101c]/90 px-4 backdrop-blur-xl lg:px-8">
          <button
            onClick={() => setMobileOpen(true)}
            className="mr-3 rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white lg:hidden"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-600">Panel administrativo</p>
            <h1 className="text-base font-semibold text-white">{pageNames[location.pathname] || 'Administración'}</h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <span className="hidden rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-xs text-emerald-400 sm:block">
              Negocio abierto
            </span>
            <Link
              to="/"
              className="rounded-xl border border-white/10 px-3 py-2 text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-white"
            >
              Ver sitio público
            </Link>
          </div>
        </header>
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
