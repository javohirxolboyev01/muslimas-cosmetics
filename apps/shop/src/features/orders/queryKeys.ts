import type { OrderRef } from './model/types';

export const orderKeys = {
  all: ['orders'] as const,
  list: (refs: OrderRef[]) => [...orderKeys.all, 'list', refs] as const,
  detail: (no: string, phone: string) => [...orderKeys.all, 'detail', no, phone] as const,
};
