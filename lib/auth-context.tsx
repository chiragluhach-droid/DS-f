'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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

  /**
   * Session lookups can take the best part of a second, which is long enough to
   * sign in while one is still in flight. Anything older than the latest change
   * is ignored, so a stale "not signed in" can never undo a fresh sign-in and
   * bounce the user back out of their dashboard.
   */
  const generation = useRef(0);

  const settle = useCallback((next: User | null, id: number) => {
    if (id !== generation.current) return;
    setUser(next);
    setLoading(false);
  }, []);

  const refresh = useCallback(async () => {
    const id = generation.current;
    try {
      const data = await get<{ user: User }>('/auth/me');
      settle(data.user, id);
    } catch {
      settle(null, id);
    }
  }, [settle]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signIn = useCallback(async (email: string, password: string) => {
    const data = await post<{ user: User }>('/auth/login', { email, password });
    generation.current += 1;
    setUser(data.user);
    setLoading(false);
    return data.user;
  }, []);

  const signUp = useCallback(
    async (input: { name: string; email: string; password: string; phone?: string }) => {
      const data = await post<{ user: User }>('/auth/register', input);
      generation.current += 1;
      setUser(data.user);
      setLoading(false);
      return data.user;
    },
    []
  );

  const signOut = useCallback(async () => {
    await post('/auth/logout');
    generation.current += 1;
    setUser(null);
    setLoading(false);
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
