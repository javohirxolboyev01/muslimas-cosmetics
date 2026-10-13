import { CheckoutForm } from '@/features/checkout';
import { useCart } from '@/features/cart';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { EmptyState, PageHeader, PageLoader } from '@/shared/ui';

export default function CheckoutPage() {
  useDocumentTitle('Buyurtma berish');
  const { lines, isLoading } = useCart();
  return (
    <div className="wrap">
      <PageHeader crumbs={[{ label: 'Savat', to: '/cart' }, { label: 'Buyurtma' }]} title="Buyurtma berish" />
      {isLoading ? (
        <PageLoader />
      ) : lines.length ? (
        <CheckoutForm />
      ) : (
        <EmptyState emoji="🛍️" title="Savat bo'sh" text="Avval mahsulot qo'shing." action={{ label: 'Katalogga', to: '/shop' }} />
      )}
    </div>
  );
}
