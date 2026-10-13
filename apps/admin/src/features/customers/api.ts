import { http } from '@/shared/api/http';
import type { Customer, Paginated } from '@/shared/types';

export type CustomerSort = 'spent' | 'orders' | 'recent';
export interface CustomerFilters { search: string; sort: CustomerSort; page: number; pageSize: number }

export const customersApi = {
  list: (filters: CustomerFilters, signal?: AbortSignal) =>
    http.get<Paginated<Customer>>('/customers', { params: { ...filters }, signal }),
};
