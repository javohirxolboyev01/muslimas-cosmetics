import { ApiError } from '@/shared/api/ApiError';
import { ORDER_TRANSITIONS } from '@/shared/config/constants';
import type { Order } from '@/shared/types';
import { db } from '../db';
import type { MockRequest, MockRoute } from '../router';
import { includesText, notFound, paginate } from '../utils';

const findIndex = (no: string) => {
  const i = db.data.orders.findIndex((o) => o.no === no);
  return i === -1 ? notFound('Buyurtma') : i;
};

export const orderRoutes: MockRoute[] = [
  {
    method: 'GET',
    path: '/orders',
    handler: ({ query }) => {
      const digits = String(query.search ?? '').replace(/\D/g, '');
      const list = db.data.orders
        .filter((o) => !query.status || o.status === query.status)
        .filter((o) => !query.delivery || o.delivery === query.delivery)
        .filter((o) =>
          includesText(`${o.no} ${o.name}`, query.search) ||
          (digits.length >= 3 && o.phone.replace(/\D/g, '').includes(digits)),
        );
      return paginate(list, query);
    },
  },
  {
    method: 'GET',
    path: '/orders/status-counts',
    handler: () =>
      db.data.orders.reduce<Record<string, number>>((acc, o) => {
        acc[o.status] = (acc[o.status] ?? 0) + 1;
        return acc;
      }, {}),
  },
  {
    method: 'GET',
    path: '/orders/:no',
    handler: ({ params }) => db.data.orders[findIndex(params.no)],
  },
  {
    method: 'PATCH',
    path: '/orders/:no',
    handler: ({ params, body }: MockRequest<Partial<Pick<Order, 'status' | 'adminNote'>>>) => {
      const i = findIndex(params.no);
      const current = db.data.orders[i];
      if (body.status && body.status !== current.status && !ORDER_TRANSITIONS[current.status].includes(body.status)) {
        throw new ApiError(409, 'Bu holatga o‘tkazib bo‘lmaydi');
      }
      db.write((d) => { d.orders[i] = { ...current, ...body }; });
      return db.data.orders[i];
    },
  },
];
