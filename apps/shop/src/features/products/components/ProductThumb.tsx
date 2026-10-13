import { ProductArt } from './ProductArt';
import type { Product } from '../model/types';
import { cn } from '@/shared/lib/cn';
import './ProductThumb.css';

/** Kichik "arka" shaklidagi mahsulot rasmi — savat, buyurtma, qidiruvda qayta ishlatiladi. */
export function ProductThumb({ product, size = 'md', flat }: { product: Product; size?: 'sm' | 'md'; flat?: boolean }) {
  return (
    <span
      className={cn('pthumb', `pthumb-${size}`)}
      style={{ background: flat ? product.bg : `linear-gradient(180deg,${product.bg},#fff)` }}
    >
      <ProductArt shape={product.shape} c1={product.color1} c2={product.color2} />
    </span>
  );
}
