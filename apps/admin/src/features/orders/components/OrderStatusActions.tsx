import { useState } from 'react';
import { getErrorMessage } from '@/shared/api/ApiError';
import { ORDER_FLOW, ORDER_STATUS, ORDER_TRANSITIONS } from '@/shared/config/constants';
import type { Order, OrderStatus } from '@/shared/types';
import { Button, ConfirmDialog, useToast } from '@/shared/ui';
import { useUpdateOrder } from '../queries';
import styles from './OrderStatusActions.module.css';

const NEXT_LABEL: Partial<Record<OrderStatus, string>> = {
  processing: 'Tayyorlashni boshlash',
  shipping: "Yo'lga chiqarish",
  delivered: 'Yetkazildi deb belgilash',
};

export function OrderStatusActions({ order }: { order: Order }) {
  const toast = useToast();
  const update = useUpdateOrder(order.no);
  const [confirmCancel, setConfirmCancel] = useState(false);

  const allowed = ORDER_TRANSITIONS[order.status];
  const currentIndex = ORDER_FLOW.indexOf(order.status);
  const next = ORDER_FLOW[currentIndex + 1];
  const back = currentIndex > 0 ? ORDER_FLOW[currentIndex - 1] : undefined;
  const canNext = !!next && allowed.includes(next);
  const canBack = !!back && allowed.includes(back);

  const setStatus = (status: OrderStatus, onDone?: () => void) => {
    if (update.isPending) return; // ikki marta bosilsa ikkinchi so'rov ketmaydi
    update.mutate({ status }, {
      onSuccess: () => {
        toast.success(`Holat: ${ORDER_STATUS[status].label}`);
        onDone?.();
      },
      onError: (e) => toast.error(getErrorMessage(e)),
    });
  };

  if (!allowed.length) {
    return <p className="muted" style={{ fontSize: '.88rem' }}>Bu buyurtma yakunlangan — holatini o'zgartirib bo'lmaydi.</p>;
  }

  const pendingStatus = update.isPending ? update.variables?.status : undefined;

  return (
    <div className={styles.actions}>
      {canNext && (
        <Button icon="check" onClick={() => setStatus(next!)} loading={pendingStatus === next} disabled={update.isPending}>
          {NEXT_LABEL[next]}
        </Button>
      )}
      {canBack && back && (
        <Button variant="secondary" onClick={() => setStatus(back)} loading={pendingStatus === back} disabled={update.isPending}>
          Orqaga: {ORDER_STATUS[back].label}
        </Button>
      )}
      {allowed.includes('cancelled') && (
        <Button variant="danger" onClick={() => setConfirmCancel(true)} disabled={update.isPending}>Bekor qilish</Button>
      )}
      <ConfirmDialog
        open={confirmCancel}
        title="Buyurtmani bekor qilish"
        message={`${order.no} buyurtmasi bekor qilinadi. Mijozga bu haqda xabar berishni unutmang.`}
        confirmText="Ha, bekor qilish"
        loading={pendingStatus === 'cancelled'}
        onConfirm={() => setStatus('cancelled', () => setConfirmCancel(false))}
        onClose={() => setConfirmCancel(false)}
      />
    </div>
  );
}
