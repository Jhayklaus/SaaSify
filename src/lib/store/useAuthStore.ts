import { create } from 'zustand';

export type Role = 'admin' | 'manager' | 'user';

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isInitialized: boolean;
  init: () => void;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isInitialized: false,

  init: () => {
    const stored = localStorage.getItem('auth');
    if (stored) {
      const parsed = JSON.parse(stored);
      set({ user: parsed.user, token: parsed.token, isInitialized: true });
    } else {
      set({ user: null, token: null, isInitialized: true });
    }
  },

  login: (user, token) => {
    localStorage.setItem('auth', JSON.stringify({ user, token }));
    set({ user, token });
  },

  logout: () => {
    localStorage.removeItem('auth');
    set({ user: null, token: null });
  },
}));
