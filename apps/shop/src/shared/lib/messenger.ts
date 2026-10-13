import type { ShopSettings } from '@mc/shared';
import { copyText } from './clipboard';
import { toast } from '@/shared/toast/toastStore';

export type Channel = 'tg' | 'wa';

/**
 * Matnni do'konga yuboradi: WhatsApp — tayyor matn bilan ochiladi,
 * Telegram — matn nusxalanadi va chat ochiladi.
 */
export async function sendToShop(channel: Channel, text: string, shop: Pick<ShopSettings, 'wa' | 'tg'>) {
  if (channel === 'wa') {
    window.open(`https://wa.me/${shop.wa}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
    return;
  }
  const ok = await copyText(text);
  toast(ok ? 'Matn nusxalandi — Telegramda yopishtiring' : 'Telegram ochildi');
  window.open(`https://t.me/${shop.tg}`, '_blank', 'noopener');
}

export const telLink = (phone: string) => `tel:${phone.replace(/\s/g, '')}`;
