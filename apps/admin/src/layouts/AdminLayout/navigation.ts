import type { IconName } from '@/shared/ui';

export interface NavItem {
  to: string;
  label: string;
  icon: IconName;
  /** Sidebar'da yangi buyurtmalar sonini ko'rsatish */
  badge?: 'newOrders';
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Boshqaruv paneli', icon: 'dashboard' },
  { to: '/orders', label: 'Buyurtmalar', icon: 'receipt', badge: 'newOrders' },
  { to: '/products', label: 'Mahsulotlar', icon: 'box' },
  { to: '/categories', label: 'Toifalar', icon: 'tag' },
  { to: '/customers', label: 'Mijozlar', icon: 'users' },
  { to: '/coupons', label: 'Promokodlar', icon: 'ticket' },
  { to: '/settings', label: 'Sozlamalar', icon: 'settings' },
];
