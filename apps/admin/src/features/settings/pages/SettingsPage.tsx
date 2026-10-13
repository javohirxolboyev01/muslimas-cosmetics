import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { getErrorMessage } from '@/shared/api/ApiError';
import { env } from '@/shared/config/env';
import type { ShopSettings } from '@/shared/types';
import { useCoupons } from '@/features/coupons/queries';
import { Button, Card, ConfirmDialog, ErrorState, Field, Input, PageHeader, Select, Skeleton, useToast } from '@/shared/ui';
import { useResetDemo, useSettings, useUpdateSettings } from '../queries';
import styles from './SettingsPage.module.css';

const money = z.coerce.number({ invalid_type_error: 'Raqam kiriting' }).int().min(0, "Manfiy bo'lmasin");
const schema = z.object({
  name: z.string().trim().min(2),
  phone: z.string().trim().min(9, 'Telefonni kiriting'),
  wa: z.string().regex(/^\d{12}$/, '998901234567 ko‘rinishida, 12 ta raqam'),
  tg: z.string().trim().regex(/^[A-Za-z0-9_]{4,32}$/, 'Username (@ belgisisiz)'),
  ig: z.string().trim().regex(/^[A-Za-z0-9_.]{2,30}$/, 'Username (@ belgisisiz)'),
  hours: z.string().trim().min(3),
  city: z.string().trim().min(2),
  freeFrom: money,
  shipCourier: money,
  shipPost: money,
  pickupAddress: z.string().trim().min(3),
  welcomeCoupon: z.string(),
});

function SettingsForm({ settings }: { settings: ShopSettings }) {
  const toast = useToast();
  const update = useUpdateSettings();
  const { data: coupons = [] } = useCoupons();
  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<ShopSettings>({
    resolver: zodResolver(schema),
    defaultValues: settings,
  });

  const submit = handleSubmit((values) => {
    if (update.isPending) return;
    update.mutate(values, {
      onSuccess: () => toast.success("Sozlamalar saqlandi"),
      onError: (e) => toast.error(getErrorMessage(e)),
    });
  });

  return (
    <form className={styles.layout} onSubmit={submit} noValidate>
      <Card title="Do'kon va aloqa">
        <div className="stack">
          <div className="grid-2">
            <Field label="Do'kon nomi" error={errors.name?.message}><Input {...register('name')} /></Field>
            <Field label="Shahar" error={errors.city?.message}><Input {...register('city')} /></Field>
          </div>
          <div className="grid-2">
            <Field label="Telefon" error={errors.phone?.message}><Input inputMode="tel" {...register('phone')} /></Field>
            <Field label="Ish vaqti" error={errors.hours?.message}><Input {...register('hours')} /></Field>
          </div>
          <Field label="WhatsApp raqami" error={errors.wa?.message} hint="Faqat raqamlar: 998901234567">
            <Input inputMode="numeric" {...register('wa')} />
          </Field>
          <div className="grid-2">
            <Field label="Telegram" error={errors.tg?.message}><Input {...register('tg')} /></Field>
            <Field label="Instagram" error={errors.ig?.message}><Input {...register('ig')} /></Field>
          </div>
        </div>
      </Card>

      <Card title="Yetkazib berish">
        <div className="stack">
          <Field label="Toshkent bo'ylab kuryer, so'm" error={errors.shipCourier?.message}>
            <Input type="number" inputMode="numeric" step={1000} {...register('shipCourier')} />
          </Field>
          <Field label="Bepul yetkazish chegarasi, so'm" error={errors.freeFrom?.message} hint="Shu summadan yuqori buyurtmalarga kuryer bepul">
            <Input type="number" inputMode="numeric" step={10000} {...register('freeFrom')} />
          </Field>
          <Field label="Viloyatlarga, so'm" error={errors.shipPost?.message}>
            <Input type="number" inputMode="numeric" step={1000} {...register('shipPost')} />
          </Field>
          <Field label="Olib ketish manzili" error={errors.pickupAddress?.message}><Input {...register('pickupAddress')} /></Field>
        </div>
      </Card>

      <Card title="Aksiya">
        <Field label="Saytda reklama qilinadigan promokod" hint="Bosh sahifa banneri va yuqori qatorda ko'rsatiladi. Faqat faol promokodlar ishlaydi.">
          {/* key: promokodlar yuklangach select qayta yaratiladi va formadagi qiymatni oladi */}
          <Select key={coupons.length} {...register('welcomeCoupon')}>
            <option value="">Ko'rsatilmasin</option>
            {coupons.map((c) => (
              <option key={c.code} value={c.code}>{c.code} — {c.percent}%{c.isActive ? '' : ' (nofaol)'}</option>
            ))}
            {settings.welcomeCoupon && !coupons.some((c) => c.code === settings.welcomeCoupon) && (
              <option value={settings.welcomeCoupon}>{settings.welcomeCoupon}</option>
            )}
          </Select>
        </Field>
      </Card>

      <div className={styles.actions}>
        <Button variant="ghost" disabled={!isDirty || update.isPending} onClick={() => reset()}>O'zgarishlarni bekor qilish</Button>
        <Button type="submit" loading={update.isPending} disabled={!isDirty}>Saqlash</Button>
      </div>
    </form>
  );
}

function DemoReset() {
  const toast = useToast();
  const resetDemo = useResetDemo();
  const [open, setOpen] = useState(false);
  return (
    <Card title="Demo ma'lumotlar" className={styles.demo}>
      <p className="muted" style={{ fontSize: '.9rem', marginBottom: 12 }}>
        Mock rejimida ma'lumotlar brauzerda (localStorage) saqlanadi. Ularni boshlang'ich holatga qaytarish mumkin.
      </p>
      <Button variant="danger" icon="refresh" onClick={() => setOpen(true)}>Demo ma'lumotlarni tiklash</Button>
      <ConfirmDialog
        open={open}
        title="Demo ma'lumotlarni tiklash"
        message="Barcha o'zgarishlar (mahsulotlar, buyurtma holatlari, promokodlar) boshlang'ich holatga qaytadi."
        confirmText="Tiklash"
        loading={resetDemo.isPending}
        onConfirm={() => resetDemo.mutate(undefined, {
          onSuccess: () => { setOpen(false); toast.success("Ma'lumotlar tiklandi"); },
          onError: (e) => toast.error(getErrorMessage(e)),
        })}
        onClose={() => setOpen(false)}
      />
    </Card>
  );
}

export default function SettingsPage() {
  const { data, dataUpdatedAt, isPending, error, refetch, isRefetching } = useSettings();
  return (
    <>
      <PageHeader title="Sozlamalar" description="Saytda ko'rinadigan aloqa ma'lumotlari, yetkazib berish narxlari va aksiya" />
      {isPending ? (
        <Card><div className="stack">{[1, 2, 3, 4].map((i) => <Skeleton key={i} height={44} />)}</div></Card>
      ) : data ? (
        <SettingsForm key={dataUpdatedAt} settings={data} />
      ) : (
        <Card><ErrorState error={error} onRetry={refetch} retrying={isRefetching} /></Card>
      )}
      {env.useMock && <DemoReset />}
    </>
  );
}
