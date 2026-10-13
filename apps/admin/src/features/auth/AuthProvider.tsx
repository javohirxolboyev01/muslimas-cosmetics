import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { authToken } from '@/shared/lib/authToken';
import type { AdminUser } from '@/shared/types';
import { authApi, type LoginPayload } from './api';

interface AuthContextValue {
  user: AdminUser | undefined;
  isAuthenticated: boolean;
  isChecking: boolean;
  login: ReturnType<typeof useLoginMutation>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
export const meQueryKey = ['auth', 'me'] as const;

function useLoginMutation(onToken: (t: string) => void) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: LoginPayload) => authApi.login(payload),
    onSuccess: ({ token, user }) => {
      authToken.set(token);
      qc.setQueryData(meQueryKey, user);
      onToken(token);
    },
  });
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const qc = useQueryClient();
  const [token, setToken] = useState(authToken.get);

  const me = useQuery({
    queryKey: meQueryKey,
    queryFn: ({ signal }) => authApi.me(signal),
    enabled: !!token,
    staleTime: Infinity,
  });

  const login = useLoginMutation(setToken);

  const logout = useCallback(() => {
    authToken.clear();
    setToken(null);
    qc.clear(); // boshqa foydalanuvchi ma'lumotlari keshda qolmasin
  }, [qc]);

  const value = useMemo<AuthContextValue>(() => ({
    user: me.data,
    isAuthenticated: !!token,
    isChecking: !!token && me.isPending,
    login,
    logout,
  }), [me.data, me.isPending, token, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth AuthProvider ichida ishlatilishi kerak');
  return ctx;
}
