import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getErrorMessage, isApiError } from '@/shared/api/ApiError';
import { DELIVERY_LABELS, PAYMENT_LABELS } from '@/shared/config/constants';
import { formatDateTime, formatMoney } from '@/shared/lib/format';
import { telHref } from '@/shared/lib/phone';
import type { Order } from '@/shared/types';
import { Button, ButtonLink, Card, EmptyState, ErrorState, Icon, PageHeader, Skeleton, Textarea, useToast } from '@/shared/ui';
import { OrderStatusActions } from '../components/OrderStatusActions';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { OrderTimeline } from '../components/OrderTimeline';
import { useOrder, useUpdateOrder } from '../queries';
import styles from './OrderDetailPage.module.css';

function AdminNote({ order }: { order: Order }) {
  const toast = useToast();
  const update = useUpdateOrder(order.no);
  const [note, setNote] = useState(order.adminNote ?? '');
  useEffect(() => {
    setNote(order.adminNote ?? '');
  }, [order.adminNote]);
  const dirty = note.trim() !== (order.adminNote ?? '');

  return (
    <Card title="Ichki izoh">
      <Textarea
        aria-label="Ichki izoh"
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Faqat adminlar ko'radi: masalan, mijoz bilan kelishuv"
        rows={3}
      />
      <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
        <Button size="sm" disabled={!dirty} loading={update.isPending && update.variables?.adminNote !== undefined}
          onClick={() => update.mutate({ adminNote: note.trim() }, {
            onSuccess: () => toast.success('Izoh saqlandi'),
            onError: (e) => toast.error(getErrorMessage(e)),
          })}>
          Saqlash
        </Button>
      </div>
    </Card>
  );
}

export default function OrderDetailPage() {
  const no = useParams().no ?? '';
  const { data: order, isPending, error, refetch, isRefetching } = useOrder(no);

  if (isPending) {
    return (
      <>
        <PageHeader title={no} backTo="/orders" />
        <div className={styles.layout}>
          <Card><div className="stack">{[1, 2, 3].map((i) => <Skeleton key={i} height={52} />)}</div></Card>
          <Card><div className="stack">{[1, 2, 3, 4].map((i) => <Skeleton key={i} />)}</div></Card>
        </div>
      </>
    );
  }

  if (!order) {
    return (
      <>
        <PageHeader title={no} backTo="/orders" />
        <Card>
          {isApiError(error) && error.status === 404
            ? <EmptyState emoji="🔍" title="Buyurtma topilmadi" action={<ButtonLink to="/orders">Ro'yxatga qaytish</ButtonLink>} />
            : <ErrorState error={error} onRetry={refetch} retrying={isRefetching} />}
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        title={order.no}
        description={<span className={styles.meta}>{formatDateTime(order.date)} <OrderStatusBadge status={order.status} /></span>}
        backTo="/orders"
      />

      <div className={styles.layout}>
        <div className={styles.main}>
          <Card title="Holat">
            <div className="stack" style={{ gap: 20 }}>
              <OrderTimeline status={order.status} />
              <OrderStatusActions order={order} />
            </div>
          </Card>

          <Card title={`Mahsulotlar (${order.items.length})`}>
            <ul className={styles.items}>
              {order.items.map((it, i) => (
                <li key={`${it.productId}-${i}`} className={styles.item}>
                  <div>
                    <Link to={`/products/${it.productId}/edit`} className={styles.itemName}>{it.name}</Link>
                    <span className="muted">{it.variantLabel && `${it.variantLabel} · `}{formatMoney(it.price)} × {it.qty}</span>
                  </div>
                  <span className="money">{formatMoney(it.price * it.qty)}</span>
                </li>
              ))}
            </ul>
            <dl className={styles.totals}>
              <div><dt>Mahsulotlar</dt><dd>{formatMoney(order.sub)}</dd></div>
              {order.disc > 0 && <div className={styles.disc}><dt>Chegirma ({order.coupon})</dt><dd>−{formatMoney(order.disc)}</dd></div>}
              <div><dt>Yetkazib berish</dt><dd>{order.ship ? formatMoney(order.ship) : 'Bepul'}</dd></div>
              <div className={styles.total}><dt>Jami</dt><dd>{formatMoney(order.total)}</dd></div>
            </dl>
          </Card>
        </div>

        <aside className={styles.side}>
          <Card title="Mijoz">
            <dl className={styles.kv}>
              <dt>Ism</dt><dd>{order.name}</dd>
              <dt>Telefon</dt><dd><a className="link" href={telHref(order.phone)}>{order.phone}</a></dd>
              <dt>Manzil</dt><dd>{order.region}, {order.city}, {order.addr}</dd>
              <dt>Yetkazish</dt><dd>{DELIVERY_LABELS[order.delivery]}</dd>
              <dt>To'lov</dt><dd>{PAYMENT_LABELS[order.pay]}</dd>
              {order.note && <><dt>Izoh</dt><dd>{order.note}</dd></>}
            </dl>
            <div className={styles.contact}>
              <a className={styles.call} href={telHref(order.phone)}><Icon name="phone" size={18} /> Qo'ng'iroq qilish</a>
            </div>
          </Card>
          <AdminNote order={order} />
        </aside>
      </div>
    </>
  );
}
