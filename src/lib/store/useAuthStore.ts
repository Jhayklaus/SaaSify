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
  isInitialized: boolean;
  init: () => void;
  login: (user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isInitialized: false,

  init: () => {
    const stored = localStorage.getItem('user');
    if (stored) {
      const parsed = JSON.parse(stored);
      set({ user: parsed, isInitialized: true });
    } else {
      set({ user: null, isInitialized: true });
    }
  },

  login: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  logout: () => {
    localStorage.removeItem('user');
    set({ user: null });
  },
}));
