import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { ProductFilters, SkinType, SortKey } from '@/features/products/model/types';

type ParamPatch = Record<string, string | number | boolean | null | undefined>;

/**
 * URL (?cat=&q=&min=&max=&skin=&sale=&sort=) ↔ ProductFilters.
 * Filtrlar URL'da saqlanadi — havolani ulashish va "orqaga" tugmasi ishlaydi.
 */
export function useShopFilters() {
  const [params] = useSearchParams();

  const filters = useMemo<ProductFilters>(() => {
    const skin = (params.get('skin') || '').split(',').filter(Boolean) as SkinType[];
    return {
      category: params.get('cat') || undefined,
      q: params.get('q')?.trim() || undefined,
      min: Number(params.get('min')) || undefined,
      max: Number(params.get('max')) || undefined,
      skin: skin.length ? skin : undefined,
      sale: params.get('sale') === '1' || undefined,
      sort: (params.get('sort') as SortKey) || 'pop',
    };
  }, [params]);

  /** Joriy parametrlarga o'zgartirish kiritib, yangi URL qaytaradi. */
  const urlWith = (patch: ParamPatch) => {
    const next = new URLSearchParams(params);
    for (const [k, val] of Object.entries(patch)) {
      if (val === '' || val == null || val === false || val === 0) next.delete(k);
      else next.set(k, String(val));
    }
    const s = next.toString();
    return '/shop' + (s ? `?${s}` : '');
  };

  const hasActive = !!(filters.category || filters.q || filters.min || filters.max || filters.skin || filters.sale);

  return { filters, urlWith, hasActive, rawQuery: params.get('q') || '' };
}
