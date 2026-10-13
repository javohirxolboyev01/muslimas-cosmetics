import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Coupon } from '@/shared/types';
import { couponsApi, type CouponInput } from './api';

export const couponKeys = { all: ['coupons'] as const };

export const useCoupons = () =>
  useQuery({ queryKey: couponKeys.all, queryFn: ({ signal }) => couponsApi.list(signal) });

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CouponInput) => couponsApi.create(input),
    onSuccess: (coupon) => qc.setQueryData<Coupon[]>(couponKeys.all, (old) => (old ? [coupon, ...old] : [coupon])),
  });
}

/** Optimistik: switch darhol o'zgaradi */
export function useUpdateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ code, ...patch }: Partial<Coupon> & { code: string }) => couponsApi.update(code, patch),
    onMutate: async ({ code, ...patch }) => {
      await qc.cancelQueries({ queryKey: couponKeys.all });
      const prev = qc.getQueryData<Coupon[]>(couponKeys.all);
      qc.setQueryData<Coupon[]>(couponKeys.all, (old) => old?.map((c) => (c.code === code ? { ...c, ...patch } : c)));
      return { prev };
    },
    onError: (_e, _v, ctx) => ctx?.prev && qc.setQueryData(couponKeys.all, ctx.prev),
    onSettled: () => qc.invalidateQueries({ queryKey: couponKeys.all }),
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: couponsApi.remove,
    onSuccess: (_d, code) => qc.setQueryData<Coupon[]>(couponKeys.all, (old) => old?.filter((c) => c.code !== code)),
  });
}
