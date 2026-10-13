import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { getErrorMessage, isApiError } from '@/shared/api/ApiError';
import { Button, Field, Input, Modal, Switch, useToast } from '@/shared/ui';
import { useCreateCoupon } from '../queries';

const schema = z.object({
  code: z.string().trim().min(3, 'Kamida 3 belgi').max(20).regex(/^[A-Za-z0-9]+$/, 'Faqat lotin harf va raqam')
    .transform((v) => v.toUpperCase()),
  percent: z.coerce.number({ invalid_type_error: 'Raqam kiriting' }).int().min(1, '1–90%').max(90, '1–90%'),
  isActive: z.boolean(),
});
type Values = z.infer<typeof schema>;
const EMPTY: Values = { code: '', percent: 10, isActive: true };

export function CouponFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const toast = useToast();
  const create = useCreateCoupon();
  const { register, control, handleSubmit, reset, setError, formState: { errors } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  useEffect(() => { if (open) reset(EMPTY); }, [open, reset]);

  const submit = handleSubmit((values) => {
    if (create.isPending) return;
    create.mutate(values, {
      onSuccess: (c) => { toast.success(`${c.code} promokodi yaratildi`); onClose(); },
      onError: (e) => {
        if (isApiError(e) && e.details?.code) setError('code', { message: e.details.code });
        else toast.error(getErrorMessage(e));
      },
    });
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Yangi promokod"
      size="sm"
      locked={create.isPending}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={create.isPending}>Bekor qilish</Button>
          <Button type="submit" form="coupon-form" loading={create.isPending}>Yaratish</Button>
        </>
      }
    >
      <form id="coupon-form" className="stack" onSubmit={submit} noValidate>
        <Field label="Kod" error={errors.code?.message} hint="Mijoz savatda kiritadi, masalan: GLOW15">
          <Input {...register('code')} style={{ textTransform: 'uppercase' }} autoComplete="off" />
        </Field>
        <Field label="Chegirma, %" error={errors.percent?.message}>
          <Input type="number" inputMode="numeric" min={1} max={90} {...register('percent')} />
        </Field>
        <Controller control={control} name="isActive"
          render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Darhol faollashtirish" />} />
      </form>
    </Modal>
  );
}
