import { useEffect } from 'react';
import { useShop } from '@/config/shop';

/** Sarlavha server bergan (api/routes/seo.ts) bilan bir xil bo'lsin — Google JS'dan keyingi sarlavhani oladi */
export function useDocumentTitle(title?: string, opts?: { full?: boolean }) {
  const { name } = useShop();
  const full = opts?.full;
  useEffect(() => {
    if (title) document.title = full ? title : `${title} — ${name}`;
  }, [title, name, full]);
}
