import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '@/services/orders.service';
import { orderKeys } from '../queryKeys';
import { useOrderRefs } from '../model/orderRefsStore';
import type { CreateOrderPayload, OrderRef } from '../model/types';

// Holat do'kon tomonidan o'zgaradi — sahifaga qaytganda yangilanib tursin
const ORDER_STALE = 30 * 1000;

export function useOrders() {
  const refs = useOrderRefs((s) => s.refs);
  return useQuery({
    queryKey: orderKeys.list(refs),
    queryFn: () => ordersService.lookup(refs),
    staleTime: ORDER_STALE,
  });
}

/** `ref` — null bo'lsa (telefon noma'lum) so'rov yuborilmaydi */
export function useOrder(ref: OrderRef | null) {
  return useQuery({
    queryKey: orderKeys.detail(ref?.no ?? '', ref?.phone ?? ''),
    queryFn: ({ signal }) => ordersService.get(ref!, signal),
    enabled: !!ref,
    retry: false,
    staleTime: ORDER_STALE,
  });
}

export function useCreateOrder() {
  const qc = useQueryClient();
  const addRef = useOrderRefs((s) => s.add);
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => ordersService.create(payload),
    onSuccess: (order) => {
      addRef({ no: order.no, phone: order.phone });
      qc.setQueryData(orderKeys.detail(order.no, order.phone), order);
      qc.invalidateQueries({ queryKey: orderKeys.all });
    },
  });
}
