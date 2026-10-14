import { Link } from 'react-router-dom';
import { ProductThumb } from '@/features/products/components/ProductThumb';
import { Icon, QtyStepper } from '@/shared/ui';
import { formatPrice } from '@/shared/lib/format';
import { useCartStore } from '../model/cartStore';
import type { CartLine } from '../model/totals';
import './CartLineItem.css';

export function CartLineItem({ line }: { line: CartLine }) {
  const changeQty = useCartStore((s) => s.changeQty);
  const remove = useCartStore((s) => s.remove);
  const { product: p } = line;
  const url = `/product/${p.id}`;

  return (
    <div className="line">
      <Link to={url} aria-label={p.name}>
        <ProductThumb product={p} />
      </Link>
      <div className="line-body">
        <h4>
          <Link to={url}>{p.name}</Link>
        </h4>
        {p.variants.length > 1 && <small>{line.variant.label} · </small>}
        <small>{formatPrice(line.price)}</small>
        <QtyStepper size="sm" className="line-qty" value={line.qty} onChange={(d) => changeQty(line.index, d)} />
      </div>
      <div className="line-tot">
        <span>{formatPrice(line.total)}</span>
        <button type="button" className="rm" onClick={() => remove(line.index)} aria-label="O'chirish"><Icon name="close" /></button>
      </div>
    </div>
  );
}
