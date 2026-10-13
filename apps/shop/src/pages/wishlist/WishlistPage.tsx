import { useWishlistStore } from '@/features/wishlist';
import { useCartStore } from '@/features/cart';
import { ProductGrid, useProductsByIds } from '@/features/products';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { toast } from '@/shared/toast/toastStore';
import { Button, EmptyState, PageHeader } from '@/shared/ui';
import './WishlistPage.css';

export default function WishlistPage() {
  useDocumentTitle('Sevimlilar');
  const ids = useWishlistStore((s) => s.ids);
  const clear = useWishlistStore((s) => s.clear);
  const add = useCartStore((s) => s.add);
  const { data, isLoading } = useProductsByIds(ids);
  const products = data?.filter((p) => ids.includes(p.id));

  const addAll = () => {
    ids.forEach((id) => add(id));
    toast("Hammasi savatga qo'shildi", { label: "Savatga o'tish", to: '/cart' });
  };

  return (
    <div className="wrap">
      <PageHeader crumbs={[{ label: 'Sevimlilar' }]} title="Sevimlilar" subtitle={ids.length ? `${ids.length} ta mahsulot saqlangan.` : undefined} />
      {ids.length ? (
        <>
          <div className="wish-actions">
            <Button onClick={addAll}>Hammasini savatga qo'shish</Button>
            <Button variant="soft" onClick={clear}>Ro'yxatni tozalash</Button>
          </div>
          <ProductGrid products={products} loading={isLoading} skeletonCount={Math.min(ids.length, 8)} />
        </>
      ) : (
        <EmptyState emoji="💗" title="Sevimlilar ro'yxati bo'sh" text="Mahsulotdagi yurakcha tugmasini bosib, yoqqanlarini shu yerda saqlang." action={{ label: "Katalogga o'tish", to: '/shop' }} />
      )}
    </div>
  );
}
