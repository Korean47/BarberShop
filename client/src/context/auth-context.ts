import { createContext } from 'react';
import type { AuthSession } from '../types';

export interface AuthState {
  session: AuthSession | null;
  loading: boolean;
  login(email: string, password: string): Promise<void>;
  logout(): Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);
