import { formatPrice } from '@/shared/lib/format';
import type { Order } from '../model/types';
import { DELIVERY_LABELS, PAYMENT_LABELS } from './labels';

/** Buyurtmani Telegram/WhatsApp uchun matnga aylantiradi. */
export function orderText(o: Order): string {
  return [
    `Yangi buyurtma ${o.no}`,
    `Ism: ${o.name}`,
    `Telefon: ${o.phone}`,
    `Manzil: ${o.region}, ${o.city}, ${o.addr}`,
    o.note ? `Izoh: ${o.note}` : '',
    'Mahsulotlar:',
    ...o.items.map((x, i) => `${i + 1}) ${x.name}${x.variantLabel ? ' (' + x.variantLabel + ')' : ''} × ${x.qty} = ${formatPrice(x.price * x.qty)}`),
    `Yetkazish: ${DELIVERY_LABELS[o.delivery]} — ${o.ship ? formatPrice(o.ship) : 'bepul'}`,
    `To'lov: ${PAYMENT_LABELS[o.pay]}`,
    o.disc ? `Chegirma: −${formatPrice(o.disc)} (${o.coupon})` : '',
    `JAMI: ${formatPrice(o.total)}`,
  ]
    .filter(Boolean)
    .join('\n');
}
