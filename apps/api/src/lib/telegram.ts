import type { FastifyBaseLogger } from 'fastify';
import type { Order } from '@mc/shared';
import { env } from '../env';

const DELIVERY: Record<Order['delivery'], string> = {
  courier: "Toshkent bo'ylab kuryer",
  post: 'Viloyatlarga yetkazish',
  pickup: "O'zi olib ketadi",
};
const PAY: Record<Order['pay'], string> = { cash: 'Naqd pul', card: "Kartaga o'tkazma" };

const money = (n: number) => `${n.toLocaleString('ru-RU').replace(/ /g, ' ')} so'm`;

export function orderMessage(o: Order): string {
  return [
    `🛍 Yangi buyurtma ${o.no}`,
    `👤 ${o.name}`,
    `📞 ${o.phone}`,
    `📍 ${o.region}, ${o.city}, ${o.addr}`,
    o.note ? `💬 ${o.note}` : null,
    '',
    ...o.items.map((x, i) => `${i + 1}) ${x.name}${x.variantLabel ? ` (${x.variantLabel})` : ''} × ${x.qty} = ${money(x.price * x.qty)}`),
    '',
    `🚚 ${DELIVERY[o.delivery]} — ${o.ship ? money(o.ship) : 'bepul'}`,
    `💳 ${PAY[o.pay]}`,
    o.disc ? `🏷 Chegirma: −${money(o.disc)} (${o.coupon})` : null,
    `💰 JAMI: ${money(o.total)}`,
  ]
    .filter((l) => l !== null)
    .join('\n');
}

/** Yangi buyurtma haqida do'kon egasiga xabar. Xato buyurtmani to'xtatmaydi — faqat log'ga yoziladi. */
export async function notifyNewOrder(order: Order, log: FastifyBaseLogger) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) return;
  try {
    const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: env.TELEGRAM_CHAT_ID, text: orderMessage(order), disable_web_page_preview: true }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) log.warn({ status: res.status, body: await res.text() }, 'Telegram xabari yuborilmadi');
  } catch (err) {
    log.warn({ err }, 'Telegram xabari yuborilmadi');
  }
}
