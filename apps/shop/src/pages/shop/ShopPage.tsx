import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { FiltersSidebar, ShopToolbar, useShopFilters } from '@/features/catalog';
import { ProductGrid, useCategoryName, useProducts } from '@/features/products';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { EmptyState, PageHeader } from '@/shared/ui';

export default function ShopPage() {
  const { filters, urlWith, hasActive, rawQuery } = useShopFilters();
  const { data, isLoading, isPlaceholderData } = useProducts(filters, { keepPrevious: true });
  const catName = useCategoryName();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const location = useLocation();
  useEffect(() => setFiltersOpen(false), [location.search]);

  const title =
    filters.sale && !filters.category && !filters.q
      ? 'Aksiyadagi mahsulotlar'
      : filters.category
        ? catName(filters.category) || 'Katalog'
        : filters.q
          ? `"${rawQuery}" bo'yicha natijalar`
          : 'Katalog';
  useDocumentTitle(title);

  const activeCount = [filters.category, filters.q, filters.min || filters.max, filters.skin, filters.sale].filter(Boolean).length;

  return (
    <div className="wrap">
      <PageHeader crumbs={[{ label: title }]} title={title} />
      <div className="shop">
        <FiltersSidebar id="shop-filters" filters={filters} urlWith={urlWith} hasActive={hasActive} open={filtersOpen} />
        <div>
          <ShopToolbar
            query={rawQuery}
            sort={filters.sort ?? 'pop'}
            urlWith={urlWith}
            filtersOpen={filtersOpen}
            onToggleFilters={() => setFiltersOpen((o) => !o)}
            filtersId="shop-filters"
            activeCount={activeCount}
          />
          {!isLoading && <div className="count" aria-live="polite">{data?.length ?? 0} ta mahsulot topildi</div>}
          {isLoading || data?.length ? (
            <ProductGrid products={data} loading={isLoading} skeletonCount={8} dimmed={isPlaceholderData} />
          ) : (
            <EmptyState icon="searchX" title="Hech narsa topilmadi" text="Boshqa so'z yozing yoki filtrlarni o'zgartiring." action={{ label: 'Barcha mahsulotlar', to: '/shop' }} />
          )}
        </div>
      </div>
    </div>
  );
}
