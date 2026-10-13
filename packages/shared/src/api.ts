import type { Category, Order, Product, ShopSettings } from './entities';

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface PageParams {
  page: number;
  pageSize: number;
}

/** API xatosi formati: { message, errors?: { maydon: xabar } } */
export interface ApiErrorBody {
  message: string;
  errors?: Record<string, string>;
}

/* ---------------- Ochiq (do'kon sayti) API turlari ---------------- */

/** Saytga beriladigan mahsulot: ichki maydonlar (qoldiq soni, faollik) yashirilgan */
export interface PublicProduct extends Omit<Product, 'stock' | 'isActive' | 'popularity' | 'createdAt'> {
  /** Birinchi variant narxi — ro'yxat va saralash uchun */
  price: number;
  oldPrice?: number;
  inStock: boolean;
}

export interface PublicCategory extends Category {
  count: number;
}

export interface PublicSettings extends ShopSettings {
  /** welcomeCoupon foizi; promokod faol bo'lmasa 0 */
  welcomePercent: number;
}

export type PublicSort = 'pop' | 'new' | 'asc' | 'desc';

export interface PublicProductQuery {
  category?: string;
  q?: string;
  min?: number;
  max?: number;
  skin?: string;
  sale?: boolean;
  sort?: PublicSort;
  tag?: string;
  limit?: number;
  ids?: string;
}

export interface CouponCheck {
  code: string;
  percent: number;
}

/** Mijoz buyurtmasi: narxlar serverda hisoblanadi, mijoz faqat nima va qancha ekanini yuboradi */
export interface CreateOrderInput {
  name: string;
  phone: string;
  region: string;
  city: string;
  addr: string;
  note: string;
  delivery: Order['delivery'];
  pay: Order['pay'];
  coupon: string;
  items: { productId: number; variant: number; qty: number }[];
}

/** Mijozga ko'rsatiladigan buyurtma — admin izohisiz */
export type PublicOrder = Omit<Order, 'adminNote'>;

export interface OrderRef {
  no: string;
  phone: string;
}
