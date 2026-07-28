import { createContext } from 'react';
import type { TenantContextData } from '../types';

export interface TenantState {
  tenant: TenantContextData;
  loading: boolean;
  unavailable: boolean;
}

export const TenantContext = createContext<TenantState | null>(null);
