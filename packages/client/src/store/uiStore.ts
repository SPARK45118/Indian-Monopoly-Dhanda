import { create } from 'zustand';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

interface UIStoreState {
  toasts: ToastItem[];
  isPropertyModalOpen: boolean;
  isEventModalOpen: boolean;
  activeEventData: { icon: string; title: string; description: string } | null;
  soundEnabled: boolean;
  musicEnabled: boolean;

  // Actions
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  removeToast: (id: string) => void;
  setPropertyModalOpen: (open: boolean) => void;
  setEventModalOpen: (open: boolean, data?: { icon: string; title: string; description: string } | null) => void;
  toggleSound: () => void;
  toggleMusic: () => void;
}

export const useUIStore = create<UIStoreState>((set) => ({
  toasts: [],
  isPropertyModalOpen: false,
  isEventModalOpen: false,
  activeEventData: null,
  soundEnabled: true,
  musicEnabled: false,

  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9);
    const duration = toast.duration ?? 4000;

    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    if (duration > 0) {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
  },

  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),

  setPropertyModalOpen: (isPropertyModalOpen) => set({ isPropertyModalOpen }),

  setEventModalOpen: (isEventModalOpen, activeEventData = null) =>
    set({ isEventModalOpen, activeEventData }),

  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),
  toggleMusic: () => set((state) => ({ musicEnabled: !state.musicEnabled })),
}));
