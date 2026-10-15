import { memo } from 'react';
import { Link } from 'react-router-dom';
import { productPath } from '@mc/shared';
import { ProductVisual } from './ProductVisual';
import { WishButton } from '@/features/wishlist/components/WishButton';
import { useAddToCart } from '@/features/cart/hooks/useAddToCart';
import { useCategoryName } from '../hooks/useCategories';
import { formatPrice } from '@/shared/lib/format';
import { Icon } from '@/shared/ui';
import type { Product } from '../model/types';
import './ProductCard.css';

export const ProductCard = memo(function ProductCard({ product: p }: { product: Product }) {
  const add = useAddToCart();
  const catName = useCategoryName();
  const url = productPath(p);

  return (
    <article className="card">
      <Link className={p.image ? 'thumb has-img' : 'thumb'} to={url} style={{ background: `linear-gradient(180deg,${p.bg},#fff)` }} aria-label={p.name}>
        {p.tag && <span className="tag">{p.tag}</span>}
        <ProductVisual product={p} />
      </Link>
      <WishButton productId={p.id} className="card-heart" />
      <div className="info">
        <small>{catName(p.categoryId)}</small>
        <h3>
          <Link to={url}>{p.name}</Link>
        </h3>
        <div className="price">
          <b>{formatPrice(p.price)}</b>
          {p.variants.length > 1 && <em>dan</em>}
          {p.oldPrice && <s>{formatPrice(p.oldPrice)}</s>}
        </div>
      </div>
      {p.inStock ? (
        <button type="button" className="add" onClick={() => add(p.id)}>
          <Icon name="plus" />
          Savatga
        </button>
      ) : (
        <button type="button" className="add" disabled aria-disabled="true">
          Tugagan
        </button>
      )}
    </article>
  );
});
