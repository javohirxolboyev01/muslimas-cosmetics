import { Link } from 'react-router-dom';
import { CartLineItem, CouponForm, FreeShippingProgress, SummaryRows, useCart } from '@/features/cart';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { Button, EmptyState, Icon, PageHeader, PageLoader, Panel } from '@/shared/ui';

export default function CartPage() {
  useDocumentTitle('Savat');
  const cart = useCart();

  return (
    <div className="wrap">
      <PageHeader crumbs={[{ label: 'Savat' }]} title="Savatingiz" />
      {cart.isLoading ? (
        <PageLoader />
      ) : cart.lines.length ? (
        <div className="two">
          <Panel>
            {cart.lines.map((l) => <CartLineItem key={`${l.product.id}-${l.variantIndex}`} line={l} />)}
            <div style={{ paddingTop: 14 }}>
              <Link className="more back-link" to="/shop"><Icon name="arrowLeft" />Xaridni davom ettirish</Link>
            </div>
          </Panel>
          <Panel as="aside" title="Buyurtma hisobi" className="sticky-aside">
            <FreeShippingProgress net={cart.net} />
            <CouponForm />
            <SummaryRows count={cart.count} sub={cart.sub} disc={cart.disc} pct={cart.pct} ship={null} net={cart.net} />
            <Button to="/checkout" block className="mt16">Buyurtmani rasmiylashtirish</Button>
          </Panel>
        </div>
      ) : (
        <EmptyState icon="bag" title="Savat hozircha bo'sh" text="Yoqqan mahsulotlaringizni qo'shing." action={{ label: 'Xaridni boshlash', to: '/shop' }} />
      )}
    </div>
  );
}
