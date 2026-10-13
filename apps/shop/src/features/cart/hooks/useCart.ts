import { useMemo } from 'react';
import { useProductMap } from '@/features/products/hooks/useProducts';
import { useCartStore } from '../model/cartStore';
import { computeTotals } from '../model/totals';

/** Savat holati + mahsulot ma'lumotlari (useQuery) asosida hisoblangan jami summalar. */
export function useCart() {
  const items = useCartStore((s) => s.items);
  const coupon = useCartStore((s) => s.coupon);
  const couponPct = useCartStore((s) => s.couponPct);
  const { data: products, isLoading } = useProductMap();
  const totals = useMemo(() => computeTotals(items, products, couponPct), [items, products, couponPct]);
  return { ...totals, coupon, isLoading: isLoading && items.length > 0, isEmpty: items.length === 0 };
}
