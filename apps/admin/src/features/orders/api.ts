import { http } from '@/shared/api/http';
import type { DeliveryMethod, Order, OrderStatus, Paginated } from '@/shared/types';

export interface OrderFilters {
  search: string;
  status: OrderStatus | '';
  delivery: DeliveryMethod | '';
  page: number;
  pageSize: number;
}

export type OrderStatusCounts = Partial<Record<OrderStatus, number>>;
export type OrderPatch = Partial<Pick<Order, 'status' | 'adminNote'>>;

export const ordersApi = {
  list: (filters: OrderFilters, signal?: AbortSignal) =>
    http.get<Paginated<Order>>('/orders', { params: { ...filters }, signal }),
  statusCounts: (signal?: AbortSignal) => http.get<OrderStatusCounts>('/orders/status-counts', { signal }),
  get: (no: string, signal?: AbortSignal) => http.get<Order>(`/orders/${encodeURIComponent(no)}`, { signal }),
  update: (no: string, patch: OrderPatch) => http.patch<Order>(`/orders/${encodeURIComponent(no)}`, patch),
};
