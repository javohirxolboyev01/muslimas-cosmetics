import { http } from '@/shared/api/http';
import type { Order, OrderStatus, Product } from '@/shared/types';

export type DashboardPeriod = 7 | 30 | 90;

export interface DashboardData {
  days: DashboardPeriod;
  revenue: number;
  revenuePrev: number;
  orders: number;
  ordersPrev: number;
  avgOrder: number;
  customers: number;
  series: { date: string; revenue: number; orders: number }[];
  statusCounts: Partial<Record<OrderStatus, number>>;
  topProducts: { productId: number; name: string; qty: number; revenue: number }[];
  lowStock: Product[];
  recentOrders: Order[];
}

export const dashboardApi = {
  get: (days: DashboardPeriod, signal?: AbortSignal) => http.get<DashboardData>('/dashboard', { params: { days }, signal }),
};
