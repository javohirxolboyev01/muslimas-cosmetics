import { shippingCost as calcShipping, discountAmount, type ShopSettings } from '@mc/shared';
import type { Product, Variant } from '@/features/products/model/types';
import type { DeliveryMethod } from '@/features/orders/model/types';
import type { CartItem } from './cartStore';

export interface CartLine {
  index: number;
  product: Product;
  variant: Variant;
  variantIndex: number;
  qty: number;
  price: number;
  total: number;
}

export interface CartTotals {
  lines: CartLine[];
  count: number;
  sub: number;
  pct: number;
  disc: number;
  net: number;
}

/**
 * Sof funksiya — savat elementlari va mahsulotlardan oldindan hisob.
 * Yakuniy summa buyurtma berilganda serverda xuddi shu formula bilan hisoblanadi.
 */
export function computeTotals(items: CartItem[], products: Map<number, Product> | undefined, pct: number): CartTotals {
  const lines: CartLine[] = [];
  items.forEach((l, index) => {
    const product = products?.get(l.id);
    if (!product) return;
    const variant = product.variants[l.v] ?? product.variants[0];
    lines.push({ index, product, variant, variantIndex: l.v, qty: l.q, price: variant.price, total: variant.price * l.q });
  });
  const sub = lines.reduce((s, l) => s + l.total, 0);
  const disc = discountAmount(sub, pct);
  return { lines, count: lines.reduce((s, l) => s + l.qty, 0), sub, pct, disc, net: sub - disc };
}

export const shippingCost = (method: DeliveryMethod, net: number, shop: Pick<ShopSettings, 'freeFrom' | 'shipCourier' | 'shipPost'>) =>
  calcShipping(method, net, shop);
