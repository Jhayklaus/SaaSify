import { create } from 'zustand';

interface ToastState {
  active: string[];
  add: (key: string) => void;
  remove: (key: string) => void;
  has: (key: string) => boolean;
}

export const useToastStore = create<ToastState>((set, get) => ({
  active: [],
  add: (key) =>
    set((state) => ({ active: [...state.active, key] })),
  remove: (key) =>
    set((state) => ({ active: state.active.filter((k) => k !== key) })),
  has: (key) => get().active.includes(key),
}));
