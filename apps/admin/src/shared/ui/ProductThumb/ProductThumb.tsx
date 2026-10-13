import { memo, useMemo } from 'react';
import { productArt } from '@/shared/lib/productArt';
import { productImageUrl } from '@/shared/lib/productImage';
import type { Product } from '@/shared/types';
import styles from './ProductThumb.module.css';

type ThumbProduct = Pick<Product, 'shape' | 'color1' | 'color2' | 'bg'> & { image?: string };

/** Rasm bo'lsa — rasm, bo'lmasa SVG illyustratsiya. SVG faqat rang/shakl o'zgarganda qayta yaratiladi */
export const ProductThumb = memo(function ProductThumb({ product, size = 48 }: { product: ThumbProduct; size?: number }) {
  const { shape, color1, color2, bg, image } = product;
  const svg = useMemo(() => (image ? '' : productArt(shape, color1, color2)), [image, shape, color1, color2]);
  const box = { width: size, height: size * 1.1, background: `linear-gradient(180deg, ${bg}, #fff)` };

  if (image) {
    return (
      <span className={styles.thumb} style={box}>
        <img className={styles.img} src={productImageUrl(image)} alt="" loading="lazy" decoding="async" />
      </span>
    );
  }
  return (
    <span
      className={styles.thumb}
      style={{ ...box, padding: `${size * 0.18}px ${size * 0.14}px ${size * 0.04}px` }}
      // productArt ranglarni HEX regex bilan tekshiradi — xavfsiz
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
});
