import { useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Scissors,
  LayoutDashboard,
  Calendar,
  Users,
  Settings,
  Menu,
  ChevronLeft,
} from 'lucide-react';

const sidebarLinks = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/appointments', label: 'Appointments', icon: Calendar },
  { to: '/admin/barbers', label: 'Barbers', icon: Users },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === '/admin') return location.pathname === '/admin';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen flex">
      {/* Sidebar - Desktop */}
      <aside
        className={`
          hidden lg:flex flex-col
          bg-slate-900 border-r border-white/5
          transition-all duration-300
          ${collapsed ? 'w-16' : 'w-64'}
        `}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-white/5">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            {!collapsed && (
              <span className="font-display text-lg font-semibold text-white">
                Blades
              </span>
            )}
          </Link>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${
                    isActive(link.to)
                      ? 'text-brand-400 bg-brand-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }
                `}
                title={collapsed ? link.label : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                {!collapsed && link.label}
              </Link>
            );
          })}
        </nav>

        {/* Collapse button */}
        <div className="p-2 border-t border-white/5">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
          >
            <ChevronLeft
              className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="w-64 h-full bg-slate-900 border-r border-white/5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="h-16 flex items-center px-4 border-b border-white/5">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                  <Scissors className="w-4 h-4 text-white" />
                </div>
                <span className="font-display text-lg font-semibold text-white">
                  Blades
                </span>
              </Link>
            </div>
            <nav className="py-4 px-2 space-y-1">
              {sidebarLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileOpen(false)}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                      transition-all duration-200
                      ${
                        isActive(link.to)
                          ? 'text-brand-400 bg-brand-500/10'
                          : 'text-slate-400 hover:text-white hover:bg-white/5'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 flex items-center px-4 lg:px-8 border-b border-white/5 bg-slate-900/50 backdrop-blur-lg">
          <button
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 mr-3"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold text-white">Admin Dashboard</h1>
          <div className="ml-auto">
            <Link
              to="/"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              ← Back to Site
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
