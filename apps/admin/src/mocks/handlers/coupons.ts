import { ApiError } from '@/shared/api/ApiError';
import type { Coupon } from '@/shared/types';
import { db } from '../db';
import type { MockRequest, MockRoute } from '../router';
import { notFound } from '../utils';

const findIndex = (code: string) => {
  const i = db.data.coupons.findIndex((c) => c.code === code);
  return i === -1 ? notFound('Promokod') : i;
};

export const couponRoutes: MockRoute[] = [
  { method: 'GET', path: '/coupons', handler: () => db.data.coupons },
  {
    method: 'POST',
    path: '/coupons',
    handler: ({ body }: MockRequest<Omit<Coupon, 'usageCount'>>) => {
      const code = body.code.toUpperCase();
      if (db.data.coupons.some((c) => c.code === code)) {
        throw new ApiError(409, 'Bunday promokod mavjud', { code: 'Bu kod band' });
      }
      const coupon: Coupon = { ...body, code, usageCount: 0 };
      db.write((d) => { d.coupons.unshift(coupon); });
      return coupon;
    },
  },
  {
    method: 'PATCH',
    path: '/coupons/:code',
    handler: ({ params, body }: MockRequest<Partial<Omit<Coupon, 'code'>>>) => {
      const i = findIndex(params.code);
      db.write((d) => { d.coupons[i] = { ...d.coupons[i], ...body }; });
      return db.data.coupons[i];
    },
  },
  {
    method: 'DELETE',
    path: '/coupons/:code',
    handler: ({ params }) => {
      const i = findIndex(params.code);
      db.write((d) => { d.coupons.splice(i, 1); });
    },
  },
];
