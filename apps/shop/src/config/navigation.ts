import type { IconName } from '@/shared/ui';

export interface NavItem {
  label: string;
  to: string;
  /** faollikni aniqlash kaliti */
  key: string;
}

export const MAIN_NAV: NavItem[] = [
  { label: 'Bosh sahifa', to: '/', key: '/' },
  { label: 'Katalog', to: '/shop', key: '/shop' },
  { label: 'Aksiya', to: '/shop?sale=1', key: '/sale' },
  { label: 'Biz haqimizda', to: '/about', key: '/about' },
  { label: 'Yetkazib berish', to: '/delivery', key: '/delivery' },
  { label: 'Aloqa', to: '/contact', key: '/contact' },
];

export interface BottomNavItem extends NavItem {
  icon: IconName;
  badge?: 'cart' | 'wish';
}

export const BOTTOM_NAV: BottomNavItem[] = [
  { label: 'Bosh', to: '/', key: '/', icon: 'home' },
  { label: 'Katalog', to: '/shop', key: '/shop', icon: 'grid' },
  { label: 'Sevimli', to: '/wishlist', key: '/wishlist', icon: 'heart', badge: 'wish' },
  { label: 'Savat', to: '/cart', key: '/cart', icon: 'bag', badge: 'cart' },
  { label: 'Buyurtma', to: '/orders', key: '/orders', icon: 'receipt' },
];
