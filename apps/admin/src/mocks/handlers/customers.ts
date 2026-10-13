import type { Customer } from '@/shared/types';
import { db } from '../db';
import type { MockRoute } from '../router';
import { includesText, paginate } from '../utils';

/** Alohida "mijozlar" jadvali yo'q — ular buyurtmalardan telefon raqami bo'yicha yig'iladi */
const aggregate = (): Customer[] => {
  const map = new Map<string, Customer>();
  for (const o of db.data.orders) {
    const c = map.get(o.phone) ?? {
      phone: o.phone, name: o.name, region: o.region, ordersCount: 0, totalSpent: 0, lastOrderAt: o.date,
    };
    c.ordersCount += 1;
    if (o.status !== 'cancelled') c.totalSpent += o.total;
    if (o.date > c.lastOrderAt) c.lastOrderAt = o.date;
    map.set(o.phone, c);
  }
  return [...map.values()];
};

const SORTERS: Record<string, (a: Customer, b: Customer) => number> = {
  spent: (a, b) => b.totalSpent - a.totalSpent,
  orders: (a, b) => b.ordersCount - a.ordersCount,
  recent: (a, b) => b.lastOrderAt.localeCompare(a.lastOrderAt),
};

export const customerRoutes: MockRoute[] = [
  {
    method: 'GET',
    path: '/customers',
    handler: ({ query }) => {
      const list = aggregate()
        .filter((c) => includesText(`${c.name} ${c.phone} ${c.region}`, query.search))
        .sort(SORTERS[String(query.sort)] ?? SORTERS.spent);
      return paginate(list, query);
    },
  },
];
