import { memo } from 'react';
import { useCategories } from '@/features/categories/queries';
import { Select, SearchInput } from '@/shared/ui';
import type { ProductFilters, ProductSort, ProductStatusFilter } from '../api';
import styles from './ProductsToolbar.module.css';

const STATUS_OPTIONS: { value: ProductStatusFilter; label: string }[] = [
  { value: 'all', label: 'Barcha holatlar' },
  { value: 'active', label: 'Faol' },
  { value: 'inactive', label: 'Yashirilgan' },
  { value: 'low', label: 'Kam qolgan' },
];
const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: 'newest', label: 'Yangilari' },
  { value: 'popular', label: 'Mashhurlari' },
  { value: 'price_asc', label: 'Arzonidan' },
  { value: 'price_desc', label: 'Qimmatidan' },
  { value: 'stock_asc', label: 'Qoldiq kam' },
];

interface Props {
  filters: Pick<ProductFilters, 'search' | 'categoryId' | 'status' | 'sort'>;
  onChange: (patch: Partial<Record<'search' | 'categoryId' | 'status' | 'sort', string>>) => void;
}

export const ProductsToolbar = memo(function ProductsToolbar({ filters, onChange }: Props) {
  const { data: categories } = useCategories();
  return (
    <div className={styles.bar}>
      <SearchInput
        className={styles.search}
        value={filters.search}
        onSearch={(search) => onChange({ search })}
        placeholder="Nomi yoki tarkibi bo'yicha…"
        label="Mahsulot qidirish"
      />
      <Select aria-label="Toifa" value={filters.categoryId} onChange={(e) => onChange({ categoryId: e.target.value })}>
        <option value="">Barcha toifalar</option>
        {categories?.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </Select>
      <Select aria-label="Holat" value={filters.status} onChange={(e) => onChange({ status: e.target.value })}>
        {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </Select>
      <Select aria-label="Saralash" value={filters.sort} onChange={(e) => onChange({ sort: e.target.value })}>
        {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </Select>
    </div>
  );
});
