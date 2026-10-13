import { HOME_REGION, useShop } from '@/config/shop';
import { formatPrice } from '@/shared/lib/format';
import { RadioCard, RadioGroup } from '@/shared/ui';
import type { CheckoutValues } from '../model/validation';
import './Checkout.css';

interface Props {
  value: CheckoutValues['delivery'];
  region: string;
  net: number;
  onChange: (v: CheckoutValues['delivery']) => void;
}

export function DeliveryOptions({ value, region, net, onChange }: Props) {
  const SHOP = useShop();
  const isHome = region === HOME_REGION;
  const set = (v: string) => onChange(v as CheckoutValues['delivery']);
  const note =
    value === 'courier' && !isHome
      ? "Kuryer xizmati faqat Toshkent shahri uchun. Boshqa hudud uchun «Viloyatlarga yetkazish»ni tanlang."
      : value === 'post' && isHome
        ? "Toshkent shahri uchun «kuryer» arzonroq bo'lishi mumkin."
        : '';

  return (
    <>
      <RadioGroup>
        <RadioCard name="delivery" value="courier" checked={value === 'courier'} onChange={set}
          title="Toshkent shahri bo'ylab kuryer" subtitle="Buyurtmadan keyin 1–2 kun ichida"
          aside={net >= SHOP.freeFrom ? 'Bepul' : formatPrice(SHOP.shipCourier)} />
        <RadioCard name="delivery" value="post" checked={value === 'post'} onChange={set}
          title="Viloyatlarga yetkazish" subtitle="Pochta yoki kuryer xizmati orqali" aside={formatPrice(SHOP.shipPost)} />
        <RadioCard name="delivery" value="pickup" checked={value === 'pickup'} onChange={set}
          title="O'zim olib ketaman" subtitle={SHOP.pickupAddress} aside="Bepul" />
      </RadioGroup>
      {note && <div className="note" role="note">{note}</div>}
    </>
  );
}
