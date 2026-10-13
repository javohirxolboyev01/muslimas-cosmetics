import { ORDER_FLOW } from '@mc/shared';
import type { DeliveryMethod, OrderStatus, PaymentMethod } from '../model/types';

export const DELIVERY_LABELS: Record<DeliveryMethod, string> = {
  courier: "Toshkent bo'ylab kuryer",
  post: 'Viloyatlarga yetkazish',
  pickup: "O'zim olib ketaman",
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  cash: 'Naqd pul (yetkazilganda)',
  card: "Kartaga o'tkazma",
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  new: 'Qabul qilindi',
  processing: 'Tayyorlanmoqda',
  shipping: "Yo'lda",
  delivered: 'Yetkazildi',
  cancelled: 'Bekor qilindi',
};

/** Holatlar ketma-ketligi (bekor qilinganidan tashqari) */
export const ORDER_STEPS = ORDER_FLOW;
