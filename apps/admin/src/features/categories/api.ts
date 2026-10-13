import { http } from '@/shared/api/http';
import type { Category } from '@/shared/types';

export interface CategoryWithCount extends Category { productCount: number }

export const categoriesApi = {
  list: (signal?: AbortSignal) => http.get<CategoryWithCount[]>('/categories', { signal }),
  create: (input: Category) => http.post<Category>('/categories', input),
  update: ({ id, ...input }: Category) => http.put<Category>(`/categories/${encodeURIComponent(id)}`, input),
  remove: (id: string) => http.delete(`/categories/${encodeURIComponent(id)}`),
};
