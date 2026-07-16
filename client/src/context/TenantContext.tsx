import { useEffect, useMemo, useState } from 'react';
import { getTenantContext } from '../services/api';
import type { TenantContextData } from '../types';
import { TenantContext, type TenantState } from './tenant-context';

const fallback: TenantContextData = {
  slug: 'blades',
  name: 'Blades Barbería',
  timezone: 'America/Hermosillo',
  currency: 'MXN',
  locale: 'es-MX',
  contactEmail: null,
  contactPhone: null,
  bookingAvailable: false,
  branding: null,
  locations: [],
  settings: [],
};

export function TenantProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<TenantState>({ tenant: fallback, loading: true, unavailable: false });

  useEffect(() => {
    let active = true;
    getTenantContext()
      .then((tenant) => active && setState({ tenant, loading: false, unavailable: false }))
      .catch(() => active && setState({ tenant: fallback, loading: false, unavailable: true }));
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const branding = state.tenant.branding;
    if (!branding) return;
    const root = document.documentElement;
    root.style.setProperty('--brand', branding.primaryColor);
    root.style.setProperty('--brand-dark', branding.secondaryColor);
    root.style.setProperty('--brand-soft', branding.accentColor);
    root.style.setProperty('--surface', branding.backgroundColor);
  }, [state.tenant]);

  const value = useMemo(() => state, [state]);
  return <TenantContext.Provider value={value}>{children}</TenantContext.Provider>;
}
