/**
 * Domen turlari — do'kon sayti, admin panel va API uchun yagona manba.
 */

export const SKIN_TYPES = ['quruq', 'yogli', 'aralash', 'sezgir', 'normal'] as const;
export type SkinType = (typeof SKIN_TYPES)[number];

export const PRODUCT_SHAPES = ['serum', 'bottle', 'jar', 'tube', 'sun', 'mask', 'lip', 'cushion'] as const;
export type ProductShape = (typeof PRODUCT_SHAPES)[number];

export const ORDER_STATUSES = ['new', 'processing', 'shipping', 'delivered', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const DELIVERY_METHODS = ['courier', 'post', 'pickup'] as const;
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];

export const PAYMENT_METHODS = ['cash', 'card'] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

export interface Variant {
  label: string;
  price: number;
  oldPrice?: number;
}

export interface Product {
  id: number;
  name: string;
  categoryId: string;
  shape: ProductShape;
  color1: string;
  color2: string;
  bg: string;
  tag: string;
  skin: SkinType[];
  variants: Variant[];
  description: string;
  ingredients: string;
  popularity: number;
  stock: number;
  isActive: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  emoji: string;
  bg: string;
}

export interface OrderItem {
  productId: number;
  name: string;
  variantLabel: string;
  qty: number;
  price: number;
}

export interface Order {
  no: string;
  date: string;
  status: OrderStatus;
  name: string;
  phone: string;
  region: string;
  city: string;
  addr: string;
  note: string;
  delivery: DeliveryMethod;
  pay: PaymentMethod;
  items: OrderItem[];
  sub: number;
  disc: number;
  ship: number;
  total: number;
  coupon: string;
  adminNote?: string;
}

export interface Customer {
  phone: string;
  name: string;
  region: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderAt: string;
}

export interface Coupon {
  code: string;
  percent: number;
  isActive: boolean;
  usageCount: number;
}

export interface ShopSettings {
  name: string;
  phone: string;
  wa: string;
  tg: string;
  ig: string;
  hours: string;
  city: string;
  freeFrom: number;
  shipCourier: number;
  shipPost: number;
  pickupAddress: string;
  /** Saytdagi banner va TopBar'da reklama qilinadigan promokod ('' — ko'rsatilmaydi) */
  welcomeCoupon: string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
}
