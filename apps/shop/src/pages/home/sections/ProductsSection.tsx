import { ProductGrid, useProducts, type ProductFilters } from '@/features/products';
import { SectionHeader } from '@/shared/ui';

interface Props {
  title: string;
  subtitle?: string;
  filters: ProductFilters;
  action?: { label: string; to: string };
}

/** Sarlavha + mahsulotlar to'ri — har qanday filtr bilan qayta ishlatiladi. */
export function ProductsSection({ title, subtitle, filters, action }: Props) {
  const { data, isLoading } = useProducts(filters);
  if (!isLoading && !data?.length) return null;
  return (
    <section className="s flush-top">
      <div className="wrap">
        <SectionHeader title={title} subtitle={subtitle} action={action} />
        <ProductGrid products={data} loading={isLoading} skeletonCount={filters.limit ?? 4} />
      </div>
    </section>
  );
}
