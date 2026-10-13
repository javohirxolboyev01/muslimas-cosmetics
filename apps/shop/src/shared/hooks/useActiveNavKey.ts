import { useLocation } from 'react-router-dom';

/** Joriy URL uchun menyu kaliti: /shop?sale=1 → '/sale', /order/MC-1 → '/orders'. */
export function useActiveNavKey() {
  const { pathname, search } = useLocation();
  if (pathname === '/shop' && new URLSearchParams(search).get('sale') === '1') return '/sale';
  if (pathname.startsWith('/order/')) return '/orders';
  if (pathname.startsWith('/product/')) return '/shop';
  return pathname;
}
