import { memo, useMemo } from 'react';
import { productArt } from '@/shared/lib/productArt';
import type { Product } from '@/shared/types';
import styles from './ProductThumb.module.css';

type ThumbProduct = Pick<Product, 'shape' | 'color1' | 'color2' | 'bg'>;

/** SVG faqat rang/shakl o'zgarganda qayta yaratiladi */
export const ProductThumb = memo(function ProductThumb({ product, size = 48 }: { product: ThumbProduct; size?: number }) {
  const { shape, color1, color2, bg } = product;
  const svg = useMemo(() => productArt(shape, color1, color2), [shape, color1, color2]);
  return (
    <span
      className={styles.thumb}
      style={{
        width: size,
        height: size * 1.1,
        padding: `${size * 0.18}px ${size * 0.14}px ${size * 0.04}px`,
        background: `linear-gradient(180deg, ${bg}, #fff)`,
      }}
      // productArt ranglarni HEX regex bilan tekshiradi — xavfsiz
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
});
