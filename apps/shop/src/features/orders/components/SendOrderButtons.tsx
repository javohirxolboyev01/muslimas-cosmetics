import { useShop } from '@/config/shop';
import { Button } from '@/shared/ui';
import { sendToShop } from '@/shared/lib/messenger';
import { orderText } from '../lib/orderText';
import type { Order } from '../model/types';

export function SendOrderButtons({ order }: { order: Order }) {
  const shop = useShop();
  return (
    <div className="ob no-print">
      <Button onClick={() => sendToShop('tg', orderText(order), shop)}>Telegramda yozish</Button>
      <Button variant="navy" onClick={() => sendToShop('wa', orderText(order), shop)}>WhatsApp'da yozish</Button>
      <Button variant="soft" onClick={() => window.print()}>Chop etish</Button>
    </div>
  );
}
