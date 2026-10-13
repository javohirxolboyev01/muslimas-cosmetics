import type { DeliveryMethod, ShopSettings } from './entities';

type ShippingSettings = Pick<ShopSettings, 'freeFrom' | 'shipCourier' | 'shipPost'>;

/** Yetkazish narxi. `net` — chegirmadan keyingi summa. */
export function shippingCost(method: DeliveryMethod, net: number, s: ShippingSettings): number {
  if (method === 'pickup') return 0;
  if (method === 'post') return s.shipPost;
  return net >= s.freeFrom ? 0 : s.shipCourier;
}

export const discountAmount = (sub: number, percent: number) => Math.round((sub * percent) / 100);

export interface OrderTotals {
  sub: number;
  disc: number;
  ship: number;
  total: number;
}

/** Buyurtma summalari — sayt (oldindan ko'rsatish) va API (yakuniy hisob) bir xil formuladan foydalanadi. */
export function orderTotals(
  lines: { price: number; qty: number }[],
  percent: number,
  delivery: DeliveryMethod,
  s: ShippingSettings,
): OrderTotals {
  const sub = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  const disc = discountAmount(sub, percent);
  const ship = shippingCost(delivery, sub - disc, s);
  return { sub, disc, ship, total: sub - disc + ship };
}
