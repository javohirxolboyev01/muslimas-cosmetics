import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { STORAGE_KEYS } from '@/shared/lib/storage';
import type { OrderRef } from './types';

interface OrderRefsState {
  refs: OrderRef[];
  add: (ref: OrderRef) => void;
}

/**
 * Shu qurilmadan berilgan buyurtmalar: faqat raqam + telefon saqlanadi,
 * buyurtmaning o'zi (va joriy holati) serverdan olinadi.
 */
export const useOrderRefs = create<OrderRefsState>()(
  persist(
    (set) => ({
      refs: [],
      add: (ref) =>
        set((s) => ({ refs: [ref, ...s.refs.filter((r) => r.no !== ref.no)].slice(0, 50) })),
    }),
    // Eski `mc_orders` (mock davridagi, serverga yetmagan buyurtmalar) ataylab o'qilmaydi
    { name: STORAGE_KEYS.orderRefs, storage: createJSONStorage(() => localStorage) },
  ),
);
