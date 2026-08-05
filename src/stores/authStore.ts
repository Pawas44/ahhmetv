import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  accessToken: string | null;
  setUser: (user: User | null) => void;
  setAuth: (user: User, accessToken: string) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  updateUser: (updates: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  accessToken: null,

  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),

  setAuth: (user, accessToken) => {
    set({ user, isAuthenticated: true, accessToken, isLoading: false });
  },

  logout: () => {
    set({ user: null, isAuthenticated: false, accessToken: null, isLoading: false });
  },

  setLoading: (isLoading) => set({ isLoading }),

  updateUser: (updates) => {
    const current = get().user;
    if (current) {
      set({ user: { ...current, ...updates } });
    }
  },
}));
export default useAuthStore;
