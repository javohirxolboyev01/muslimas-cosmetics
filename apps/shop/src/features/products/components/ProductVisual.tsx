import { ProductArt } from './ProductArt';
import { uploadUrl } from '@/shared/api/http';
import type { Product } from '../model/types';

type VisualProduct = Pick<Product, 'name' | 'image' | 'shape' | 'color1' | 'color2'>;

/** Yuklangan rasm bo'lsa — rasm, bo'lmasa SVG qadoq illyustratsiyasi */
export function ProductVisual({ product: p, eager }: { product: VisualProduct; eager?: boolean }) {
  if (p.image) {
    return <img className="pimg" src={uploadUrl(p.image)} alt={p.name} loading={eager ? 'eager' : 'lazy'} decoding="async" />;
  }
  return <ProductArt shape={p.shape} c1={p.color1} c2={p.color2} />;
}
