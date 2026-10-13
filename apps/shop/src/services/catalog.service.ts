import type { CouponCheck, PublicSettings } from '@mc/shared';
import { http } from '@/shared/api/http';
import type { CategoryWithCount } from '@/features/products/model/types';

export const catalogService = {
  categories: (signal?: AbortSignal) => http.get<CategoryWithCount[]>('/public/categories', undefined, signal),
  regions: (signal?: AbortSignal) => http.get<string[]>('/public/regions', undefined, signal),
  settings: (signal?: AbortSignal) => http.get<PublicSettings>('/public/settings', undefined, signal),
  checkCoupon: (code: string) => http.get<CouponCheck>(`/public/coupons/${encodeURIComponent(code.trim().toUpperCase())}`),
};
