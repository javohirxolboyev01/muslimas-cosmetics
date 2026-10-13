import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/shared/lib/storage';

interface RecentState {
  ids: number[];
  push: (id: number) => void;
}

export const useRecentlyViewed = create<RecentState>()(
  persist(
    (set) => ({
      ids: [],
      push: (id) => set((s) => ({ ids: [id, ...s.ids.filter((x) => x !== id)].slice(0, 8) })),
    }),
    { name: STORAGE_KEYS.recent, storage: createJSONStorage(() => localStorage) },
  ),
);
