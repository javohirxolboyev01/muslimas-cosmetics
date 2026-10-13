import { useRef, type FormEvent } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useShop } from '@/config/shop';
import { isApiError } from '@/shared/api/http';
import { useNavigate } from 'react-router-dom';
import { useCart, useCartStore, shippingCost, SummaryLine, SummaryRows } from '@/features/cart';
import { productKeys, useRegions } from '@/features/products';
import { useCreateOrder } from '@/features/orders';
import { Button, FieldRow, FormField, Panel } from '@/shared/ui';
import { toast } from '@/shared/toast/toastStore';
import { useCheckoutForm } from '../hooks/useCheckoutForm';
import { DeliveryOptions } from './DeliveryOptions';
import { PaymentOptions } from './PaymentOptions';
import type { CheckoutValues } from '../model/validation';
import './Checkout.css';

const FIELD_ORDER: (keyof CheckoutValues)[] = ['name', 'phone', 'city', 'addr'];

export function CheckoutForm() {
  const navigate = useNavigate();
  const cart = useCart();
  const clearCart = useCartStore((s) => s.clear);
  const removeCoupon = useCartStore((s) => s.removeCoupon);
  const shop = useShop();
  const qc = useQueryClient();
  const { data: regions = [] } = useRegions();
  const { values: v, errors, set, setErrors, validate, resetNote } = useCheckoutForm();
  const createOrder = useCreateOrder();
  const formRef = useRef<HTMLFormElement>(null);

  const ship = shippingCost(v.delivery, cart.net, shop);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const errs = validate();
    const first = FIELD_ORDER.find((k) => errs[k]);
    if (first) {
      formRef.current?.querySelector<HTMLInputElement>(`[name=${first}]`)?.focus();
      toast("Qizil maydonlarni to'ldiring");
      return;
    }
    if (createOrder.isPending) return;
    // Faqat nima va qancha — narx, chegirma va yetkazish narxini server o'zi hisoblaydi
    createOrder.mutate(
      {
        name: v.name.trim(), phone: v.phone, region: v.region, city: v.city.trim(), addr: v.addr.trim(), note: v.note.trim(),
        delivery: v.delivery, pay: v.pay, coupon: cart.coupon,
        items: cart.lines.map((l) => ({ productId: l.product.id, variant: l.variantIndex, qty: l.qty })),
      },
      {
        onSuccess: (order) => {
          clearCart();
          resetNote();
          navigate(`/order/${order.no}`, { replace: true });
        },
        onError: (err) => {
          if (!isApiError(err) || err.status >= 500 || err.status === 0) {
            toast(isApiError(err) && err.status === 0 ? err.message : "Xatolik yuz berdi. Qayta urinib ko'ring");
            return;
          }
          if (err.errors?.coupon) removeCoupon();
          // 409 — narx/qoldiq o'zgargan: mahsulotlarni yangilab, sababini ko'rsatamiz
          if (err.status === 409) qc.invalidateQueries({ queryKey: productKeys.all });
          if (err.errors) setErrors((e) => ({ ...e, ...err.errors }));
          toast(err.errors?.coupon ? `${err.errors.coupon}. Promokod olib tashlandi` : err.message);
        },
      },
    );
  };

  const input = (name: 'name' | 'phone' | 'city' | 'addr') => ({
    id: `f-${name}`,
    name,
    value: v[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(name, e.target.value),
    'aria-invalid': !!errors[name],
    'aria-describedby': errors[name] ? `f-${name}-err` : undefined,
  });

  return (
    <form ref={formRef} className="two" onSubmit={onSubmit} noValidate>
      <div className="co-steps">
        <Panel title="1. Aloqa ma'lumotlari">
          <FieldRow>
            <FormField label="Ism va familiya" htmlFor="f-name" error={errors.name}>
              <input {...input('name')} autoComplete="name" placeholder="Masalan: Madina Karimova" />
            </FormField>
            <FormField label="Telefon raqam" htmlFor="f-phone" error={errors.phone}>
              <input {...input('phone')} inputMode="tel" autoComplete="tel" placeholder="+998 90 123 45 67" />
            </FormField>
          </FieldRow>
        </Panel>

        <Panel title="2. Manzil">
          <FieldRow>
            <FormField label="Viloyat" htmlFor="f-region">
              <select id="f-region" name="region" value={v.region} onChange={(e) => set('region', e.target.value)}>
                {(regions.length ? regions : [v.region]).map((r) => <option key={r}>{r}</option>)}
              </select>
            </FormField>
            <FormField label="Shahar / tuman" htmlFor="f-city" error={errors.city}>
              <input {...input('city')} autoComplete="address-level2" placeholder="Masalan: Chilonzor tumani" />
            </FormField>
          </FieldRow>
          <FormField label="Ko'cha, uy, mo'ljal" htmlFor="f-addr" error={errors.addr}>
            <input {...input('addr')} autoComplete="street-address" placeholder="Ko'cha nomi, uy va xonadon, mo'ljal" />
          </FormField>
          <FormField label="Izoh (ixtiyoriy)" htmlFor="f-note" className="mb0">
            <textarea id="f-note" name="note" value={v.note} onChange={(e) => set('note', e.target.value)} placeholder="Masalan: qo'ng'iroq qilib keling" />
          </FormField>
        </Panel>

        <Panel title="3. Yetkazib berish usuli">
          <DeliveryOptions value={v.delivery} region={v.region} net={cart.net} onChange={(d) => set('delivery', d)} />
        </Panel>

        <Panel title="4. To'lov usuli">
          <PaymentOptions value={v.pay} onChange={(p) => set('pay', p)} />
        </Panel>
      </div>

      <Panel as="aside" title="Buyurtmangiz" className="sticky-aside">
        {cart.lines.map((l) => (
          <SummaryLine key={`${l.product.id}-${l.variantIndex}`} product={l.product} name={l.product.name}
            variantLabel={l.product.variants.length > 1 ? l.variant.label : ''} qty={l.qty} total={l.total} />
        ))}
        <div style={{ marginTop: 10 }}>
          <SummaryRows count={cart.count} sub={cart.sub} disc={cart.disc} pct={cart.pct} ship={ship} net={cart.net} />
        </div>
        <Button type="submit" block style={{ marginTop: 16 }} disabled={createOrder.isPending}>
          {createOrder.isPending ? 'Yuborilmoqda…' : 'Buyurtmani tasdiqlash'}
        </Button>
        <p className="co-hint">Tugmani bosganingizda buyurtma do'konga yuboriladi. Tasdiqlash uchun siz bilan bog'lanamiz.</p>
      </Panel>
    </form>
  );
}
