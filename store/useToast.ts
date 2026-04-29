import { create } from 'zustand';

type ToastVariant = 'success' | 'error';

interface ToastStore {
  message: string | null;
  variant: ToastVariant;
  show: (message: string, variant?: ToastVariant) => void;
  hide: () => void;
}

export const useToast = create<ToastStore>((set) => ({
  message: null,
  variant: 'success',
  show: (message, variant = 'success') => set({ message, variant }),
  hide: () => set({ message: null }),
}));
