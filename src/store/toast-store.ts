import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

const MAX_TOASTS = 3;
const AUTO_DISMISS_MS = 4000;

interface ToastStore {
  toasts: Toast[];
  add: (type: ToastType, message: string) => void;
  remove: (id: string) => void;
}

export const useToastStore = create<ToastStore>()((set, get) => ({
  toasts: [],

  add: (type, message) => {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const toast: Toast = { id, type, message };

    set((state) => {
      const next = [...state.toasts, toast];
      return { toasts: next.length > MAX_TOASTS ? next.slice(-MAX_TOASTS) : next };
    });

    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, AUTO_DISMISS_MS);
  },

  remove: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));
