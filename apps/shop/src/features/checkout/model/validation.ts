import { isValidPhone } from '@/shared/lib/phone';

export interface CheckoutValues {
  name: string;
  phone: string;
  region: string;
  city: string;
  addr: string;
  note: string;
  delivery: 'courier' | 'post' | 'pickup';
  pay: 'cash' | 'card';
}

export type CheckoutErrors = Partial<Record<keyof CheckoutValues, string>>;

export function validateCheckout(v: CheckoutValues): CheckoutErrors {
  const e: CheckoutErrors = {};
  if (v.name.trim().length < 3) e.name = 'Ismingizni kiriting';
  if (!isValidPhone(v.phone)) e.phone = "Raqamni to'liq kiriting (9 ta raqam)";
  if (v.city.trim().length < 2) e.city = 'Shahar yoki tumanni kiriting';
  if (v.addr.trim().length < 4) e.addr = 'Manzilni kiriting';
  return e;
}
