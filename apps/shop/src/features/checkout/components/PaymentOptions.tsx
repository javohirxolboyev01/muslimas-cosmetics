import { RadioCard, RadioGroup } from '@/shared/ui';
import type { CheckoutValues } from '../model/validation';

interface Props {
  value: CheckoutValues['pay'];
  onChange: (v: CheckoutValues['pay']) => void;
}

export function PaymentOptions({ value, onChange }: Props) {
  const set = (v: string) => onChange(v as CheckoutValues['pay']);
  return (
    <RadioGroup>
      <RadioCard name="pay" value="cash" checked={value === 'cash'} onChange={set} title="Naqd pul" subtitle="Buyurtma yetkazilganda to'laysiz" />
      <RadioCard name="pay" value="card" checked={value === 'card'} onChange={set} title="Kartaga o'tkazma" subtitle="Buyurtma tasdiqlangach to'lov rekvizitlari yuboriladi" />
    </RadioGroup>
  );
}
