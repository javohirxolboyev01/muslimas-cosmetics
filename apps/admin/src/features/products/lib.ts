import { LOW_STOCK_LIMIT } from '@/shared/config/constants';
import { formatMoney } from '@/shared/lib/format';
import type { Product } from '@/shared/types';
import type { BadgeTone } from '@/shared/ui';

export const priceRange = (p: Pick<Product, 'variants'>) => {
  const prices = p.variants.map((v) => v.price);
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? formatMoney(min) : `${formatMoney(min)} – ${formatMoney(max)}`;
};

export const stockInfo = (stock: number): { tone: BadgeTone; label: string } => {
  if (stock === 0) return { tone: 'bad', label: 'Tugagan' };
  if (stock <= LOW_STOCK_LIMIT) return { tone: 'warn', label: `${stock} ta qoldi` };
  return { tone: 'ok', label: `${stock} ta` };
};
