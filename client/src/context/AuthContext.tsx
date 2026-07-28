import { useEffect, useMemo, useState } from 'react';
import { authMe, login as loginRequest, logout as logoutRequest, setCsrfToken } from '../services/api';
import type { AuthSession } from '../types';
import { AuthContext, type AuthState } from './auth-context';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authMe()
      .then((value) => {
        if (value) {
          setCsrfToken(value.csrf);
          setSession(value);
        }
      })
      .catch(() => setSession(null))
      .finally(() => setLoading(false));
  }, []);

  const value = useMemo<AuthState>(() => ({
    session,
    loading,
    async login(email, password) {
      const result = await loginRequest(email, password);
      setCsrfToken(result.csrf);
      const current = await authMe();
      if (!current) throw new Error('La sesión no pudo iniciarse');
      setCsrfToken(current.csrf);
      setSession(current);
    },
    async logout() {
      await logoutRequest();
      setCsrfToken('');
      setSession(null);
    },
  }), [loading, session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
