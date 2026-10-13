import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

type Defaults = Record<string, string>;

/**
 * Ro'yxat filtrlari URL'da saqlanadi: sahifani yangilash, orqaga qaytish va havolani ulashishda
 * holat yo'qolmaydi. Filtr o'zgarganda sahifa avtomatik 1 ga qaytadi.
 */
export function useListParams<T extends Defaults>(defaults: T) {
  const [searchParams, setSearchParams] = useSearchParams();

  const values = useMemo(() => {
    const out = { ...defaults } as T & { page: number };
    for (const key of Object.keys(defaults)) {
      const v = searchParams.get(key);
      if (v !== null) (out as Defaults)[key] = v;
    }
    out.page = Math.max(1, Number(searchParams.get('page')) || 1);
    return out;
    // defaults — komponent ichida konstanta sifatida beriladi
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const setParams = useCallback(
    (patch: Partial<Record<keyof T | 'page', string | number>>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [k, v] of Object.entries(patch)) {
            const isDefault = v === '' || v === undefined || String(v) === defaults[k] || (k === 'page' && Number(v) <= 1);
            if (isDefault) next.delete(k);
            else next.set(k, String(v));
          }
          if (!('page' in patch)) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams, defaults],
  );

  return [values, setParams] as const;
}
