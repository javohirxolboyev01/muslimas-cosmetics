import { useCallback } from 'react';
import { useWishlistStore } from '../model/wishlistStore';
import { toast } from '@/shared/toast/toastStore';

export function useToggleWish() {
  const toggle = useWishlistStore((s) => s.toggle);
  return useCallback(
    (id: number) => {
      const added = toggle(id);
      if (added) toast("Sevimlilarga qo'shildi 💗", { label: "Ko'rish", to: '/wishlist' });
      else toast('Sevimlilardan olib tashlandi');
    },
    [toggle],
  );
}
