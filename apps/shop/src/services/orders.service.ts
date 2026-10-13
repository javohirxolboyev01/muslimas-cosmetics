import { http } from '@/shared/api/http';
import type { CreateOrderPayload, Order, OrderRef } from '@/features/orders/model/types';

export const ordersService = {
  /** Shu qurilmadan berilgan buyurtmalar (raqam + telefon juftliklari bo'yicha) */
  lookup: (refs: OrderRef[]) => (refs.length ? http.post<Order[]>('/public/orders/lookup', { refs }) : Promise.resolve([])),

  get: (ref: OrderRef, signal?: AbortSignal) =>
    http.get<Order>(`/public/orders/${encodeURIComponent(ref.no)}`, { phone: ref.phone }, signal),

  create: (payload: CreateOrderPayload) => http.post<Order>('/public/orders', payload),
};
