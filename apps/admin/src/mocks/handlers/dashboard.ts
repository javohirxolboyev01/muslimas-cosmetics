import { LOW_STOCK_LIMIT } from '@/shared/config/constants';
import type { Order, OrderStatus } from '@/shared/types';
import { db } from '../db';
import type { MockRoute } from '../router';
import { startOfDay } from '../utils';

const DAY = 86_400_000;
const isPaid = (o: Order) => o.status !== 'cancelled';
const sumRevenue = (orders: Order[]) => orders.filter(isPaid).reduce((s, o) => s + o.total, 0);

export const dashboardRoutes: MockRoute[] = [
  {
    method: 'GET',
    path: '/dashboard',
    handler: ({ query }) => {
      const days = [7, 30, 90].includes(Number(query.days)) ? Number(query.days) : 7;
      const from = startOfDay(new Date()).getTime() - (days - 1) * DAY;
      const prevFrom = from - days * DAY;
      const { orders, products } = db.data;

      const inRange = orders.filter((o) => Date.parse(o.date) >= from);
      const prevRange = orders.filter((o) => {
        const t = Date.parse(o.date);
        return t >= prevFrom && t < from;
      });

      const series = Array.from({ length: days }, (_, i) => {
        const start = from + i * DAY;
        const dayOrders = inRange.filter((o) => {
          const t = Date.parse(o.date);
          return t >= start && t < start + DAY;
        });
        return { date: new Date(start).toISOString(), revenue: sumRevenue(dayOrders), orders: dayOrders.length };
      });

      const statusCounts = inRange.reduce<Partial<Record<OrderStatus, number>>>((acc, o) => {
        acc[o.status] = (acc[o.status] ?? 0) + 1;
        return acc;
      }, {});

      const productMap = new Map<number, { productId: number; name: string; qty: number; revenue: number }>();
      inRange.filter(isPaid).forEach((o) =>
        o.items.forEach((it) => {
          const row = productMap.get(it.productId) ?? { productId: it.productId, name: it.name, qty: 0, revenue: 0 };
          row.qty += it.qty;
          row.revenue += it.qty * it.price;
          productMap.set(it.productId, row);
        }),
      );

      const revenue = sumRevenue(inRange);
      const paidCount = inRange.filter(isPaid).length;

      return {
        days,
        revenue,
        revenuePrev: sumRevenue(prevRange),
        orders: inRange.length,
        ordersPrev: prevRange.length,
        avgOrder: paidCount ? Math.round(revenue / paidCount) : 0,
        customers: new Set(inRange.map((o) => o.phone)).size,
        series,
        statusCounts,
        topProducts: [...productMap.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 5),
        lowStock: products
          .filter((p) => p.isActive && p.stock <= LOW_STOCK_LIMIT)
          .sort((a, b) => a.stock - b.stock)
          .slice(0, 6),
        recentOrders: orders.slice(0, 6),
      };
    },
  },
];
