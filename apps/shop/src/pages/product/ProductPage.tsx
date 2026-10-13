import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { ProductGrid, useCategoryName, useProduct, useProductsByIds, useRelatedProducts } from '@/features/products';
import { useRecentlyViewed } from '@/features/recently-viewed/recentlyViewedStore';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { PageHeader, PageLoader, SectionHeader } from '@/shared/ui';
import NotFoundPage from '../not-found/NotFoundPage';
import { ProductDetails } from './ProductDetails';
import './ProductPage.css';

export default function ProductPage() {
  const id = Number(useParams().id);
  const { data: product, isLoading, isError } = useProduct(id);
  const { data: related, isLoading: relLoading } = useRelatedProducts(id);
  const catName = useCategoryName();
  const pushRecent = useRecentlyViewed((s) => s.push);
  const recentIds = useRecentlyViewed((s) => s.ids).filter((x) => x !== id).slice(0, 4);
  const { data: seen } = useProductsByIds(recentIds);
  useDocumentTitle(product?.name);

  useEffect(() => {
    if (product) pushRecent(product.id);
  }, [product, pushRecent]);

  if (isLoading) return <PageLoader />;
  if (isError || !product) return <NotFoundPage />;

  return (
    <div className="wrap">
      <PageHeader
        compact
        crumbs={[{ label: 'Katalog', to: '/shop' }, { label: catName(product.categoryId), to: `/shop?cat=${product.categoryId}` }, { label: product.name }]}
      />
      {/* key — boshqa mahsulotga o'tilganda variant/miqdor holati yangilanadi */}
      <ProductDetails key={product.id} product={product} />

      <section className="s flush-bottom">
        <SectionHeader title="Sizga yoqishi mumkin" action={{ label: "Yana ko'rish", to: `/shop?cat=${product.categoryId}` }} />
        <ProductGrid products={related} loading={relLoading} />
      </section>

      {recentIds.length > 0 && seen && seen.length > 0 && (
        <section className="s flush-bottom">
          <SectionHeader title="Yaqinda ko'rilganlar" />
          <ProductGrid products={seen} />
        </section>
      )}
    </div>
  );
}
