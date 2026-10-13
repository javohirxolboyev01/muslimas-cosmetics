import { ProductThumb } from '@/features/products/components/ProductThumb';
import type { Product } from '@/features/products/model/types';
import { formatPrice } from '@/shared/lib/format';
import './Summary.css';

interface Props {
  product?: Product;
  name: string;
  variantLabel?: string;
  qty: number;
  total: number;
}

/** Ixcham qator: checkout va buyurtma sahifalarida. */
export function SummaryLine({ product, name, variantLabel, qty, total }: Props) {
  return (
    <div className="sumline">
      {product ? <ProductThumb product={product} size="sm" /> : <span />}
      <span>
        {name}
        {variantLabel ? ` · ${variantLabel}` : ''}
        <br />
        <small>× {qty}</small>
      </span>
      <b>{formatPrice(total)}</b>
    </div>
  );
}
