import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { SummaryLine, SummaryRows } from '@/features/cart';
import {
  DELIVERY_LABELS, ORDER_STATUS_LABELS, OrderSteps, PAYMENT_LABELS, SendOrderButtons, useOrder, useOrderRefs, type OrderRef,
} from '@/features/orders';
import { useProductMap } from '@/features/products';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { formatDate } from '@/shared/lib/format';
import { Icon } from '@/shared/ui';
import { isValidPhone, maskPhone } from '@/shared/lib/phone';
import { Button, EmptyState, FormField, PageHeader, PageLoader, Panel } from '@/shared/ui';
import './OrdersPage.css';

/** Begona buyurtmani ko'rib bo'lmasligi uchun telefon raqami so'raladi */
function PhoneGate({ no, onSubmit, failed }: { no: string; onSubmit: (phone: string) => void; failed: boolean }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!isValidPhone(phone)) return setError("Raqamni to'liq kiriting");
    onSubmit(phone);
  };
  return (
    <Panel title={`Buyurtma ${no}`} className="track-gate">
      <p className="muted">Buyurtmani ko'rish uchun buyurtma berilgan telefon raqamini kiriting.</p>
      <form onSubmit={submit} noValidate>
        <FormField label="Telefon raqam" htmlFor="g-phone" error={error || (failed ? 'Bu raqam bilan buyurtma topilmadi' : undefined)}>
          <input id="g-phone" inputMode="tel" autoComplete="tel" placeholder="+998 90 123 45 67" value={phone}
            onChange={(e) => { setPhone(maskPhone(e.target.value)); setError(''); }} />
        </FormField>
        <Button type="submit" block>Ko'rish</Button>
      </form>
    </Panel>
  );
}

export default function OrderPage() {
  const no = (useParams().no ?? '').toUpperCase();
  const stored = useOrderRefs((s) => s.refs.find((r) => r.no === no));
  const addRef = useOrderRefs((s) => s.add);
  const [asked, setAsked] = useState<OrderRef | null>(null);
  const ref = stored ?? asked;

  const { data: o, isLoading, isError } = useOrder(ref);
  const { data: products } = useProductMap();
  useDocumentTitle(o ? `Buyurtma ${o.no}` : 'Buyurtma');

  // Telefon orqali topilgan buyurtma "Buyurtmalarim" ro'yxatiga qo'shiladi
  useEffect(() => {
    if (o && !stored) addRef({ no: o.no, phone: o.phone });
  }, [o, stored, addRef]);

  const crumbs = [{ label: 'Buyurtmalar', to: '/orders' }, { label: no }];

  if (!ref || (isError && !stored)) {
    return (
      <div className="wrap">
        <PageHeader compact crumbs={crumbs} />
        <PhoneGate no={no} failed={isError} onSubmit={(phone) => setAsked({ no, phone })} />
      </div>
    );
  }
  if (isLoading) return <PageLoader />;
  if (isError || !o) {
    return (
      <div className="wrap">
        <PageHeader crumbs={[{ label: 'Buyurtmalar', to: '/orders' }, { label: 'Topilmadi' }]} />
        <EmptyState icon="searchX" title="Buyurtma topilmadi" text="Buyurtma raqamini tekshiring yoki do'kon bilan bog'laning." action={{ label: 'Aloqa', to: '/contact' }} />
      </div>
    );
  }

  const details: [string, string][] = [
    ['Sana', formatDate(o.date, true)],
    ['Holat', ORDER_STATUS_LABELS[o.status]],
    ['Ism', o.name],
    ['Telefon', o.phone],
    ['Manzil', `${o.region}, ${o.city}, ${o.addr}`],
    ['Yetkazish', DELIVERY_LABELS[o.delivery]],
    ["To'lov", PAYMENT_LABELS[o.pay]],
    ...(o.note ? ([['Izoh', o.note]] as [string, string][]) : []),
  ];

  const fresh = o.status === 'new';

  return (
    <div className="wrap">
      <PageHeader compact crumbs={crumbs} />
      <Panel className="okbox">
        <div className="big" aria-hidden="true"><Icon name={o.status === 'cancelled' ? 'package' : fresh ? 'checkCircle' : 'truck'} /></div>
        <h1>{fresh ? 'Buyurtmangiz qabul qilindi!' : `Buyurtma: ${ORDER_STATUS_LABELS[o.status].toLowerCase()}`}</h1>
        <div className="ono">{o.no}</div>
        {fresh && (
          <p className="muted okbox-text">
            Buyurtma do'konga yetib bordi. Tasdiqlash uchun tez orada siz bilan bog'lanamiz. Savolingiz bo'lsa — yozing:
          </p>
        )}
        <SendOrderButtons order={o} />
        <OrderSteps status={o.status} />
      </Panel>

      <div className="two">
        <Panel title="Mahsulotlar">
          {o.items.map((x, i) => (
            <SummaryLine key={i} product={products?.get(x.productId)} name={x.name} variantLabel={x.variantLabel} qty={x.qty} total={x.price * x.qty} />
          ))}
          <div style={{ marginTop: 12 }}>
            <SummaryRows count={0} sub={o.sub} disc={o.disc} ship={o.ship} net={o.sub - o.disc} />
          </div>
        </Panel>
        <Panel title="Ma'lumotlar">
          <dl className="kv">
            {details.map(([k, v]) => (
              <div key={k}><dt>{k}</dt><dd>{v}</dd></div>
            ))}
          </dl>
          <p className="muted" style={{ fontSize: '.8rem', marginTop: 14 }}>Holat do'kon tomonidan yangilanadi — bu sahifani istalgan vaqt ochib ko'rishingiz mumkin.</p>
        </Panel>
      </div>
    </div>
  );
}
