import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/shared/lib/storage';

interface WishlistState {
  ids: number[];
  toggle: (id: number) => boolean;
  clear: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      /** true qaytarsa — qo'shildi, false — olib tashlandi */
      toggle: (id) => {
        const has = get().ids.includes(id);
        set({ ids: has ? get().ids.filter((x) => x !== id) : [...get().ids, id] });
        return !has;
      },
      clear: () => set({ ids: [] }),
    }),
    { name: STORAGE_KEYS.wish, storage: createJSONStorage(() => localStorage) },
  ),
);

export const useIsWished = (id: number) => useWishlistStore((s) => s.ids.includes(id));
export const useWishCount = () => useWishlistStore((s) => s.ids.length);
