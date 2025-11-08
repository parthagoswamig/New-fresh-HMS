import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  tenantId: string;
  phone?: string;
  staff?: {
    id: string;
  };
}

export interface Tenant {
  id: string;
  name: string;
  subdomain: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  tenant: Tenant | null;
  isAuthenticated: boolean;
  login: (user: User, token: string, refreshToken: string, tenant: Tenant) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      refreshToken: null,
      tenant: null,
      isAuthenticated: false,
      login: (user, token, refreshToken, tenant) =>
        set({
          user,
          token,
          refreshToken,
          tenant,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          refreshToken: null,
          tenant: null,
          isAuthenticated: false,
        }),
      updateUser: (userData) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...userData } : null,
        })),
    }),
    {
      name: 'carestack-auth',
    }
  )
);
