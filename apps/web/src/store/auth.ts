'use client';

import type { AuthResponse, PublicUser } from '@oneset/types';
import { useEffect, useState } from 'react';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi, registerAuthBridge } from '@/lib/api';

interface AuthState {
  user: PublicUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  status: 'idle' | 'loading';
  login: (email: string, password: string) => Promise<PublicUser>;
  register: (input: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<PublicUser>;
  logout: () => Promise<void>;
  setSession: (payload: AuthResponse) => void;
}

/**
 * Tokens live in localStorage for Sprint 3 so the API stays stateless and easy to test.
 * Production note in the README: move the refresh token to an httpOnly cookie.
 */
export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      status: 'idle',

      setSession: (payload) =>
        set({
          user: payload.user,
          accessToken: payload.accessToken,
          refreshToken: payload.refreshToken,
        }),

      login: async (email, password) => {
        set({ status: 'loading' });
        try {
          const session = await authApi.login({ email, password });
          get().setSession(session);
          return session.user;
        } finally {
          set({ status: 'idle' });
        }
      },

      register: async (input) => {
        set({ status: 'loading' });
        try {
          const session = await authApi.register(input);
          get().setSession(session);
          return session.user;
        } finally {
          set({ status: 'idle' });
        }
      },

      logout: async () => {
        try {
          if (get().accessToken) await authApi.logout();
        } catch {
          // Logging out locally must work even if the API is unreachable.
        }
        set({ user: null, accessToken: null, refreshToken: null });
      },
    }),
    {
      name: 'oneset-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);

let refreshInFlight: Promise<string | null> | null = null;

registerAuthBridge({
  getAccessToken: () => useAuth.getState().accessToken,
  refreshSession: () => {
    if (refreshInFlight) return refreshInFlight;

    refreshInFlight = (async () => {
      const token = useAuth.getState().refreshToken;
      if (!token) return null;
      try {
        const session = await authApi.refresh(token);
        useAuth.getState().setSession(session);
        return session.accessToken;
      } catch {
        useAuth.setState({ user: null, accessToken: null, refreshToken: null });
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();

    return refreshInFlight;
  },
});

export const useIsAuthenticated = () => useAuth((state) => Boolean(state.accessToken));

/**
 * True once the persisted store has actually read localStorage back.
 *
 * On a hard navigation (a fresh page load, not a client-side route change —
 * e.g. someone refreshes /checkout, opens it in a new tab, or a test drives
 * the browser via page.goto), `user` starts as `null` for one tick before
 * zustand's persist middleware finishes rehydrating. Any page that redirects
 * on `!user` needs to wait for this to flip true first, or it bounces a
 * genuinely logged-in visitor to /login before their session has loaded.
 */
export function useAuthHydrated() {
  const [hydrated, setHydrated] = useState(() =>
    typeof window === 'undefined' ? false : useAuth.persist.hasHydrated(),
  );

  useEffect(() => {
    setHydrated(useAuth.persist.hasHydrated());
    return useAuth.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
}
