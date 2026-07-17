import { useEffect, useState } from 'react';
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
  paymentOptions: { cash: true, online: false, provider: null },
  bookingRules: { minimumNoticeMinutes: 120, maxAdvanceDays: 90, changeCutoffHours: 2, holdMinutes: 30 },
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
    root.style.setProperty('--primary', branding.primaryColor);
    root.style.setProperty('--text', branding.secondaryColor);
    root.style.setProperty('--accent', branding.accentColor);
    root.style.setProperty('--background', branding.backgroundColor);
    root.style.setProperty('--brand', branding.primaryColor);
    root.style.setProperty('--brand-dark', branding.secondaryColor);
    root.style.setProperty('--surface', branding.backgroundColor);
    root.style.setProperty('--font-body', branding.fontFamily);
  }, [state.tenant]);

  return <TenantContext.Provider value={state}>{children}</TenantContext.Provider>;
}
