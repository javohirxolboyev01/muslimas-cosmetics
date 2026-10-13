import { useCallback } from 'react';
import { useCartStore } from '../model/cartStore';
import { toast } from '@/shared/toast/toastStore';

export function useAddToCart() {
  const add = useCartStore((s) => s.add);
  return useCallback(
    (id: number, variant = 0, qty = 1, opts: { silent?: boolean } = {}) => {
      add(id, variant, qty);
      if (!opts.silent) toast("Savatga qo'shildi ✨", { label: "Savatga o'tish", to: '/cart' });
    },
    [add],
  );
}
