'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { get, post } from './api';
import type { User } from './types';

interface AuthState {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (input: { name: string; email: string; password: string; phone?: string }) => Promise<User>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await get<{ user: User }>('/auth/me');
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signIn = useCallback(async (email: string, password: string) => {
    const data = await post<{ user: User }>('/auth/login', { email, password });
    setUser(data.user);
    return data.user;
  }, []);

  const signUp = useCallback(
    async (input: { name: string; email: string; password: string; phone?: string }) => {
      const data = await post<{ user: User }>('/auth/register', input);
      setUser(data.user);
      return data.user;
    },
    []
  );

  const signOut = useCallback(async () => {
    await post('/auth/logout');
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, signIn, signUp, signOut, refresh }),
    [user, loading, signIn, signUp, signOut, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

/** Where each role belongs after signing in. */
export const homeForRole = (role: User['role']) =>
  ({
    admin: '/dashboard/admin',
    restaurant: '/dashboard/restaurant',
    ngo: '/dashboard/ngo',
    customer: '/donations',
  })[role];
