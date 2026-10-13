import { useEffect } from 'react';
import { useShop } from '@/config/shop';

export function useDocumentTitle(title?: string) {
  const { name } = useShop();
  useEffect(() => {
    if (title) document.title = `${title} — ${name}`;
  }, [title, name]);
}
