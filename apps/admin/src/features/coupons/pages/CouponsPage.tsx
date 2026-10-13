import { useMemo, useState } from 'react';
import { getErrorMessage } from '@/shared/api/ApiError';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import type { Coupon } from '@/shared/types';
import {
  Badge, Button, Card, ConfirmDialog, DataTable, EmptyState, ErrorState, PageHeader, Switch, useToast, type Column,
} from '@/shared/ui';
import { CouponFormModal } from '../components/CouponFormModal';
import { useCoupons, useDeleteCoupon, useUpdateCoupon } from '../queries';

export default function CouponsPage() {
  const toast = useToast();
  const { data, isPending, error, refetch, isRefetching } = useCoupons();
  const { mutate: updateCoupon } = useUpdateCoupon();
  const remove = useDeleteCoupon();
  const form = useDisclosure();
  const [toDelete, setToDelete] = useState<Coupon | null>(null);

  const columns = useMemo<Column<Coupon>[]>(() => [
    { key: 'code', header: 'Kod', mobile: 'primary', cell: (c) => <strong style={{ letterSpacing: '.08em' }}>{c.code}</strong> },
    { key: 'percent', header: 'Chegirma', cell: (c) => <Badge tone="pink">−{c.percent}%</Badge> },
    { key: 'usage', header: 'Ishlatilgan', cell: (c) => `${c.usageCount} marta` },
    {
      key: 'active',
      header: 'Faol',
      cell: (c) => (
        <Switch checked={c.isActive} hideLabel label={`${c.code} faol`}
          onChange={(isActive) => updateCoupon({ code: c.code, isActive }, { onError: (e) => toast.error(getErrorMessage(e)) })} />
      ),
    },
    {
      key: 'actions', header: '', align: 'right', mobile: 'actions',
      cell: (c) => <Button variant="ghost" size="sm" icon="trash" onClick={() => setToDelete(c)}>O'chirish</Button>,
    },
  ], [updateCoupon, toast]);

  return (
    <>
      <PageHeader title="Promokodlar" description="Savatda qo'llanadigan chegirma kodlari"
        actions={<Button icon="plus" onClick={() => form.open()}>Yangi promokod</Button>} />
      <Card flush>
        {error && !data ? (
          <ErrorState error={error} onRetry={refetch} retrying={isRefetching} />
        ) : (
          <DataTable caption="Promokodlar" columns={columns} rows={data} rowKey={(c) => c.code} loading={isPending} skeletonRows={3}
            empty={<EmptyState emoji="🎟️" title="Promokod yo'q" action={<Button icon="plus" onClick={() => form.open()}>Yaratish</Button>} />} />
        )}
      </Card>

      <CouponFormModal open={form.isOpen} onClose={form.close} />
      <ConfirmDialog
        open={!!toDelete}
        title="Promokodni o'chirish"
        message={`${toDelete?.code} promokodi o'chiriladi va mijozlar uni ishlata olmaydi.`}
        confirmText="O'chirish"
        loading={remove.isPending}
        onConfirm={() => toDelete && !remove.isPending && remove.mutate(toDelete.code, {
          onSuccess: () => { toast.success("Promokod o'chirildi"); setToDelete(null); },
          onError: (e) => toast.error(getErrorMessage(e)),
        })}
        onClose={() => setToDelete(null)}
      />
    </>
  );
}
