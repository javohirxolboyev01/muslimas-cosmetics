import { useMutation } from '@tanstack/react-query';
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { OrderListItem, useOrderRefs, useOrders, type OrderRef } from '@/features/orders';
import { ordersService } from '@/services/orders.service';
import { isApiError } from '@/shared/api/http';
import { useDocumentTitle } from '@/shared/hooks/useDocumentTitle';
import { isValidPhone, maskPhone } from '@/shared/lib/phone';
import { toast } from '@/shared/toast/toastStore';
import { Button, EmptyState, FormField, PageHeader, Panel, Skeleton } from '@/shared/ui';
import './OrdersPage.css';

export default function OrdersPage() {
  useDocumentTitle('Buyurtmalarim');
  const { data: orders, isLoading, isError, refetch } = useOrders();
  const addRef = useOrderRefs((s) => s.add);
  const navigate = useNavigate();
  const [no, setNo] = useState('');
  const [phone, setPhone] = useState('');
  const track = useMutation({ mutationFn: (ref: OrderRef) => ordersService.get(ref) });

  const onTrack = (e: FormEvent) => {
    e.preventDefault();
    const v = no.trim().toUpperCase();
    if (!v) return toast('Buyurtma raqamini kiriting');
    if (!isValidPhone(phone)) return toast('Telefon raqamini kiriting');
    track.mutate({ no: v, phone }, {
      onSuccess: (o) => {
        addRef({ no: o.no, phone: o.phone });
        navigate(`/order/${o.no}`);
      },
      onError: (err) =>
        toast(isApiError(err) && err.status === 404 ? 'Bunday buyurtma topilmadi. Raqam va telefonni tekshiring.' : "Qidirib bo'lmadi. Qayta urinib ko'ring"),
    });
  };

  return (
    <div className="wrap">
      <PageHeader crumbs={[{ label: 'Buyurtmalarim' }]} title="Buyurtmalarim" subtitle="Shu qurilmadan berilgan buyurtmalar va ularning holati." />
      <div className="two">
        <div className="olist">
          {isLoading ? (
            Array.from({ length: 3 }, (_, i) => <Skeleton key={i} style={{ height: 76, borderRadius: 20 }} />)
          ) : isError ? (
            <EmptyState icon="alert" title="Yuklab bo'lmadi" text="Internet aloqasini tekshiring." action={{ label: 'Qayta urinish', onClick: () => refetch() }} />
          ) : orders?.length ? (
            orders.map((o) => <OrderListItem key={o.no} order={o} />)
          ) : (
            <EmptyState icon="package" title="Hozircha buyurtma yo'q" text="Birinchi buyurtmangizni bering." action={{ label: 'Katalogga', to: '/shop' }} />
          )}
        </div>
        <Panel as="aside" title="Buyurtmani qidirish">
          <form onSubmit={onTrack} noValidate>
            <FormField label="Buyurtma raqami" htmlFor="tno">
              <input id="tno" value={no} onChange={(e) => setNo(e.target.value)} placeholder="MC-123456" autoComplete="off" />
            </FormField>
            <FormField label="Telefon raqam" htmlFor="tphone">
              <input id="tphone" inputMode="tel" value={phone} onChange={(e) => setPhone(maskPhone(e.target.value))} placeholder="+998 90 123 45 67" />
            </FormField>
            <Button type="submit" block disabled={track.isPending}>{track.isPending ? 'Qidirilmoqda…' : 'Topish'}</Button>
          </form>
        </Panel>
      </div>
    </div>
  );
}
