import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { customersApi, type CustomerFilters } from './api';

export const customerKeys = {
  all: ['customers'] as const,
  list: (filters: CustomerFilters) => [...customerKeys.all, 'list', filters] as const,
};

export const useCustomers = (filters: CustomerFilters) =>
  useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: ({ signal }) => customersApi.list(filters, signal),
    placeholderData: keepPreviousData,
  });
