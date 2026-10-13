import { memo } from 'react';
import { Link } from 'react-router-dom';
import { ProductArt } from './ProductArt';
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
  const url = `/product/${p.id}`;

  return (
    <article className="card">
      <Link className="thumb" to={url} style={{ background: `linear-gradient(180deg,${p.bg},#fff)` }} aria-label={p.name}>
        {p.tag && <span className="tag">{p.tag}</span>}
        <ProductArt shape={p.shape} c1={p.color1} c2={p.color2} />
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
