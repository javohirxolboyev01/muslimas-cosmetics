import type { OrderStatus, SkinType } from './entities';

export const LOW_STOCK_LIMIT = 5;
export const MAX_QTY = 20;
export const HOME_REGION = 'Toshkent shahri';

export const SKIN_LABELS: Record<SkinType, string> = {
  quruq: 'Quruq',
  yogli: "Yog'li",
  aralash: 'Aralash',
  sezgir: 'Sezgir',
  normal: 'Normal',
};

export const REGIONS = [
  'Toshkent shahri', 'Toshkent viloyati', 'Andijon', 'Buxoro', "Farg'ona", 'Jizzax', 'Xorazm',
  'Namangan', 'Navoiy', 'Qashqadaryo', 'Samarqand', 'Sirdaryo', 'Surxondaryo', "Qoraqalpog'iston",
];

/** Buyurtmaning normal yo'li (bekor qilishdan tashqari) */
export const ORDER_FLOW: OrderStatus[] = ['new', 'processing', 'shipping', 'delivered'];

/** Ruxsat etilgan holat o'tishlari — yetkazilgan yoki bekor qilingan buyurtma yakuniy hisoblanadi */
export const ORDER_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  new: ['processing', 'cancelled'],
  processing: ['shipping', 'new', 'cancelled'],
  shipping: ['delivered', 'processing', 'cancelled'],
  delivered: [],
  cancelled: [],
};

export const canTransition = (from: OrderStatus, to: OrderStatus) =>
  from === to || ORDER_TRANSITIONS[from].includes(to);
