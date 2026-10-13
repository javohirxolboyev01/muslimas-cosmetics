import { http } from '@/shared/api/http';
import type { Coupon } from '@/shared/types';

export type CouponInput = Omit<Coupon, 'usageCount'>;

export const couponsApi = {
  list: (signal?: AbortSignal) => http.get<Coupon[]>('/coupons', { signal }),
  create: (input: CouponInput) => http.post<Coupon>('/coupons', input),
  update: (code: string, patch: Partial<Omit<Coupon, 'code'>>) => http.patch<Coupon>(`/coupons/${encodeURIComponent(code)}`, patch),
  remove: (code: string) => http.delete(`/coupons/${encodeURIComponent(code)}`),
};
