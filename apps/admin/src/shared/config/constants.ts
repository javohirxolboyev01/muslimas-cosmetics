import type { DeliveryMethod, OrderStatus, PaymentMethod } from '@/shared/types';

export { LOW_STOCK_LIMIT, ORDER_FLOW, ORDER_TRANSITIONS, REGIONS, SKIN_LABELS } from '@mc/shared';

export const PAGE_SIZE = 10;

export const ORDER_STATUS: Record<OrderStatus, { label: string; tone: 'info' | 'warn' | 'accent' | 'ok' | 'bad' }> = {
  new: { label: 'Yangi', tone: 'info' },
  processing: { label: 'Tayyorlanmoqda', tone: 'warn' },
  shipping: { label: "Yo'lda", tone: 'accent' },
  delivered: { label: 'Yetkazildi', tone: 'ok' },
  cancelled: { label: 'Bekor qilindi', tone: 'bad' },
};

export const DELIVERY_LABELS: Record<DeliveryMethod, string> = {
  courier: "Toshkent bo'ylab kuryer",
  post: 'Viloyatlarga yetkazish',
  pickup: "O'zi olib ketadi",
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: 'Naqd pul',
  card: "Kartaga o'tkazma",
};

