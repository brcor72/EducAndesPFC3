import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService } from '../services/auth.service';

interface User {
  id: string;
  dni: string;
  displayName: string;
  community?: string;
  preferredLang: string;
  avatarUrl?: string;
  gender?: string;
  skinTone?: string;
  birthYear?: number;
  activity?: string;
  role: { id: string; name: string };
  createdAt: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  initialized: boolean;
  setUser: (user: User | null) => void;
  login: (dni: string, password: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => Promise<void>;
  loadMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      loading: false,
      initialized: false,

      setUser: (user) => set({ user }),

      login: async (dni, password) => {
        set({ loading: true });
        try {
          const user = await authService.login({ dni, password });
          set({ user, initialized: true });
        } finally {
          set({ loading: false });
        }
      },

      register: async (payload) => {
        set({ loading: true });
        try {
          const result = await authService.register(payload);
          // Auto-login after register
          const user = await authService.login({ dni: payload.dni, password: payload.password });
          set({ user, initialized: true });
        } finally {
          set({ loading: false });
        }
      },

      logout: async () => {
        await authService.logout();
        set({ user: null });
      },

      loadMe: async () => {
        if (!localStorage.getItem('access_token')) {
          set({ initialized: true });
          return;
        }
        set({ loading: true });
        try {
          const user = await authService.getMe();
          set({ user, initialized: true });
        } catch {
          set({ user: null, initialized: true });
        } finally {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'educandes-auth',
      partialize: (state) => ({ user: state.user }),
    },
  ),
);
