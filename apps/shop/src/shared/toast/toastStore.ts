import { create } from 'zustand';

export interface ToastLink {
  label: string;
  to: string;
}

interface ToastState {
  id: number;
  message: string;
  link?: ToastLink;
  visible: boolean;
  show: (message: string, link?: ToastLink) => void;
  hide: () => void;
}

let timer: ReturnType<typeof setTimeout> | undefined;

export const useToastStore = create<ToastState>((set) => ({
  id: 0,
  message: '',
  visible: false,
  show: (message, link) => {
    clearTimeout(timer);
    set((s) => ({ id: s.id + 1, message, link, visible: true }));
    timer = setTimeout(() => set({ visible: false }), link ? 3600 : 2300);
  },
  hide: () => set({ visible: false }),
}));

/** Komponentdan tashqarida ham chaqirish mumkin: toast("Saqlandi") */
export const toast = (message: string, link?: ToastLink) => useToastStore.getState().show(message, link);
