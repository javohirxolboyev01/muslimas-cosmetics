import { http } from '@/shared/api/http';
import { env } from '@/shared/config/env';
import type { Paginated, Product } from '@/shared/types';

export type ProductStatusFilter = 'all' | 'active' | 'inactive' | 'low';
export type ProductSort = 'newest' | 'popular' | 'price_asc' | 'price_desc' | 'stock_asc';

export interface ProductFilters {
  search: string;
  categoryId: string;
  status: ProductStatusFilter;
  sort: ProductSort;
  page: number;
  pageSize: number;
}

export type ProductInput = Omit<Product, 'id' | 'createdAt' | 'popularity'>;

export const productsApi = {
  list: ({ status, ...rest }: ProductFilters, signal?: AbortSignal) =>
    http.get<Paginated<Product>>('/products', { params: { ...rest, status: status === 'all' ? '' : status }, signal }),
  get: (id: number, signal?: AbortSignal) => http.get<Product>(`/products/${id}`, { signal }),
  create: (input: ProductInput) => http.post<Product>('/products', input),
  update: (id: number, input: ProductInput) => http.put<Product>(`/products/${id}`, input),
  patch: (id: number, input: Partial<ProductInput>) => http.patch<Product>(`/products/${id}`, input),
  remove: (id: number) => http.delete(`/products/${id}`),
  /** Rasmni yuklaydi va fayl nomini qaytaradi. Mock rejimida rasm data URL ko'rinishida localStorage'da saqlanadi */
  uploadImage: async (file: Blob): Promise<string> => {
    if (env.useMock) return readAsDataUrl(file);
    return (await http.upload<{ name: string }>('/uploads', file)).name;
  },
};

const readAsDataUrl = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
