import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Order, Paginated } from '@/shared/types';
import { ordersApi, type OrderFilters, type OrderPatch } from './api';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: OrderFilters) => [...orderKeys.lists(), filters] as const,
  counts: () => [...orderKeys.all, 'counts'] as const,
  detail: (no: string) => [...orderKeys.all, 'detail', no] as const,
};

export const useOrders = (filters: OrderFilters) =>
  useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: ({ signal }) => ordersApi.list(filters, signal),
    placeholderData: keepPreviousData,
  });

/**
 * Sidebar'dagi "yangi buyurtmalar" belgisi va buyurtmalar sahifasidagi tablar shu bitta
 * so'rovdan foydalanadi — bir xil queryKey bo'lgani uchun tarmoqqa faqat 1 marta boradi.
 * Yangi buyurtmalarni ko'rib turish uchun har daqiqada (faqat oyna faol bo'lsa) yangilanadi.
 */
export const useOrderStatusCounts = () =>
  useQuery({
    queryKey: orderKeys.counts(),
    queryFn: ({ signal }) => ordersApi.statusCounts(signal),
    refetchInterval: 60_000,
    refetchIntervalInBackground: false,
  });

export function useOrder(no: string) {
  const qc = useQueryClient();
  return useQuery<Order>({
    queryKey: orderKeys.detail(no),
    queryFn: ({ signal }) => ordersApi.get(no, signal),
    // Ro'yxatdan kelgan bo'lsak — keshdagi qator darhol ko'rsatiladi, to'liq ma'lumot fonda keladi
    placeholderData: () =>
      qc
        .getQueriesData<Paginated<Order>>({ queryKey: orderKeys.lists() })
        .flatMap(([, page]) => page?.items ?? [])
        .find((o) => o.no === no),
  });
}

export function useUpdateOrder(no: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationKey: ['orders', 'update', no],
    mutationFn: (patch: OrderPatch) => ordersApi.update(no, patch),
    onMutate: async (patch) => {
      await qc.cancelQueries({ queryKey: orderKeys.detail(no) });
      const prev = qc.getQueryData<Order>(orderKeys.detail(no));
      if (prev) qc.setQueryData<Order>(orderKeys.detail(no), { ...prev, ...patch });
      return { prev };
    },
    onError: (_e, _p, ctx) => ctx?.prev && qc.setQueryData(orderKeys.detail(no), ctx.prev),
    onSuccess: (order) => {
      qc.setQueryData(orderKeys.detail(no), order);
      // ro'yxatlardagi shu buyurtmani ham yangilaymiz — qayta so'rovsiz
      qc.setQueriesData<Paginated<Order>>({ queryKey: orderKeys.lists() }, (old) =>
        old && { ...old, items: old.items.map((o) => (o.no === no ? order : o)) },
      );
    },
    onSettled: (_d, _e, patch) => {
      if (patch.status) {
        qc.invalidateQueries({ queryKey: orderKeys.counts() });
        qc.invalidateQueries({ queryKey: orderKeys.lists() });
        qc.invalidateQueries({ queryKey: ['dashboard'] });
        qc.invalidateQueries({ queryKey: ['customers'] });
      }
    },
  });
}
