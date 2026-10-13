import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MAX_QTY } from '@/config/shop';
import { STORAGE_KEYS } from '@/shared/lib/storage';

export interface CartItem {
  id: number;
  /** variant indeksi */
  v: number;
  q: number;
}

interface CartState {
  items: CartItem[];
  coupon: string;
  /** Promokod foizi (server tekshirgan); yakuniy hisob baribir serverda */
  couponPct: number;
  add: (id: number, v?: number, q?: number) => void;
  changeQty: (index: number, delta: number) => void;
  remove: (index: number) => void;
  clear: () => void;
  applyCoupon: (code: string, pct: number) => void;
  removeCoupon: () => void;
}

const clampQty = (q: number) => Math.min(MAX_QTY, q);

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      coupon: '',
      couponPct: 0,
      add: (id, v = 0, q = 1) =>
        set((s) => {
          const found = s.items.find((l) => l.id === id && l.v === v);
          if (found) return { items: s.items.map((l) => (l === found ? { ...l, q: clampQty(l.q + q) } : l)) };
          return { items: [...s.items, { id, v, q: clampQty(q) }] };
        }),
      changeQty: (index, delta) =>
        set((s) => {
          const items = [...s.items];
          const l = items[index];
          if (!l) return s;
          const q = clampQty(l.q + delta);
          if (q <= 0) items.splice(index, 1);
          else items[index] = { ...l, q };
          return { items };
        }),
      remove: (index) => set((s) => ({ items: s.items.filter((_, i) => i !== index) })),
      clear: () => set({ items: [], coupon: '', couponPct: 0 }),
      applyCoupon: (code, pct) => set({ coupon: code.trim().toUpperCase(), couponPct: pct }),
      removeCoupon: () => set({ coupon: '', couponPct: 0 }),
    }),
    {
      name: STORAGE_KEYS.cart,
      storage: createJSONStorage(() => localStorage),
      version: 1,
      // v0 da promokod foizi saqlanmagan — eski promokodni olib tashlaymiz (qayta kiritiladi)
      migrate: (persisted, version) => {
        const s = (persisted ?? {}) as Partial<CartState>;
        return version < 1 ? { ...s, coupon: '', couponPct: 0 } : s;
      },
    },
  ),
);

export const useCartCount = () => useCartStore((s) => s.items.reduce((sum, l) => sum + l.q, 0));

/** Komponentdan tashqarida ishlatish uchun */
export const cartActions = () => useCartStore.getState();
