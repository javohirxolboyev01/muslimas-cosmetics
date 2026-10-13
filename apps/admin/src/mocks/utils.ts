import { ApiError } from '@/shared/api/ApiError';
import type { QueryParams } from '@/shared/api/http';
import type { Paginated } from '@/shared/types';

export const paginate = <T,>(items: T[], query: QueryParams): Paginated<T> => {
  const pageSize = Math.max(1, Number(query.pageSize) || 10);
  const total = items.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, Number(query.page) || 1), pageCount);
  return { items: items.slice((page - 1) * pageSize, page * pageSize), total, page, pageSize, pageCount };
};

export const includesText = (haystack: string, needle?: unknown) =>
  !needle || haystack.toLowerCase().includes(String(needle).trim().toLowerCase());

export const notFound = (what = 'Resurs'): never => {
  throw new ApiError(404, `${what} topilmadi`);
};

export const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
