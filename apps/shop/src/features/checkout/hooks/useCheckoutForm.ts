import { useEffect, useState } from 'react';
import { HOME_REGION } from '@/config/shop';
import { storage, STORAGE_KEYS } from '@/shared/lib/storage';
import { maskPhone } from '@/shared/lib/phone';
import { validateCheckout, type CheckoutErrors, type CheckoutValues } from '../model/validation';

const initial = (): CheckoutValues => {
  const d = storage.get<Partial<CheckoutValues>>(STORAGE_KEYS.draft, {});
  const region = d.region || HOME_REGION;
  return {
    name: d.name ?? '',
    phone: d.phone ?? '',
    region,
    city: d.city ?? '',
    addr: d.addr ?? '',
    note: d.note ?? '',
    delivery: d.delivery ?? (region === HOME_REGION ? 'courier' : 'post'),
    pay: d.pay ?? 'cash',
  };
};

/** Checkout formasi holati: qoralama avtomatik saqlanadi, telefon maskalanadi. */
export function useCheckoutForm() {
  const [values, setValues] = useState<CheckoutValues>(initial);
  const [errors, setErrors] = useState<CheckoutErrors>({});

  useEffect(() => storage.set(STORAGE_KEYS.draft, values), [values]);

  const set = <K extends keyof CheckoutValues>(key: K, value: CheckoutValues[K]) => {
    setValues((v) => {
      const next = { ...v, [key]: key === 'phone' ? maskPhone(String(value)) : value };
      // Viloyat o'zgarsa — mos yetkazish usulini avtomatik tanlaymiz
      if (key === 'region' && v.delivery !== 'pickup') next.delivery = value === HOME_REGION ? 'courier' : 'post';
      return next;
    });
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  const validate = () => {
    const e = validateCheckout(values);
    setErrors(e);
    return e;
  };

  const resetNote = () => setValues((v) => ({ ...v, note: '' }));

  return { values, errors, set, setErrors, validate, resetNote };
}
