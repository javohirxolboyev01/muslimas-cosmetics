import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useCategories } from '@/features/categories/queries';
import { SKIN_LABELS } from '@/shared/config/constants';
import { cn } from '@/shared/lib/cn';
import { PRODUCT_SHAPES } from '@/shared/lib/productArt';
import type { SkinType } from '@/shared/types';
import { Button, ButtonLink, Card, Field, Input, Select, Switch, Textarea } from '@/shared/ui';
import { productSchema, type ProductFormValues } from '../schema';
import { ImagePicker } from './ImagePicker';
import styles from './ProductForm.module.css';

interface ProductFormProps {
  defaultValues: ProductFormValues;
  onSubmit: (values: ProductFormValues) => void;
  submitting: boolean;
  submitText: string;
  /** Serverdan kelgan maydon xatolari (422/409) */
  serverErrors?: Record<string, string>;
  /** Tahrirlashda: hech narsa o'zgarmagan bo'lsa saqlash tugmasi o'chiq (keraksiz so'rov yo'q) */
  requireDirty?: boolean;
}

const SKIN_OPTIONS = Object.entries(SKIN_LABELS) as [SkinType, string][];
const COLOR_FIELDS = [
  { name: 'color1', label: 'Rang 1' },
  { name: 'color2', label: 'Rang 2' },
  { name: 'bg', label: 'Fon' },
] as const;

export function ProductForm({ defaultValues, onSubmit, submitting, submitText, serverErrors, requireDirty }: ProductFormProps) {
  const { data: categories, isPending: categoriesLoading } = useCategories();
  const { register, control, handleSubmit, formState: { errors, isDirty } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues,
  });
  const variants = useFieldArray({ control, name: 'variants' });

  const submit = handleSubmit((values) => {
    if (!submitting) onSubmit(values);
  });

  return (
    <form className={styles.layout} onSubmit={submit} noValidate>
      <div className={styles.main}>
        <Card title="Asosiy ma'lumotlar">
          <div className="stack">
            <Field label="Nomi" error={errors.name?.message}>
              <Input placeholder="Masalan: Centella tinchlantiruvchi serum" {...register('name')} />
            </Field>
            <div className="grid-2">
              <Field label="Toifa" error={errors.categoryId?.message ?? serverErrors?.categoryId}>
                {/* Controlled: toifalar formadan keyin yuklansa ham tanlangan qiymat yo'qolmaydi */}
                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field }) => (
                    <Select {...field} disabled={categoriesLoading}>
                      <option value="">{categoriesLoading ? 'Yuklanmoqda…' : 'Tanlang'}</option>
                      {categories?.map((c) => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                    </Select>
                  )}
                />
              </Field>
              <Field label="Belgi (ixtiyoriy)" error={errors.tag?.message} hint="Masalan: Hit, Yangi, −15%">
                <Input {...register('tag')} />
              </Field>
            </div>
            <Field label="Tavsif" error={errors.description?.message}>
              <Textarea rows={4} {...register('description')} />
            </Field>
            <Field label="Tarkib" error={errors.ingredients?.message}>
              <Input placeholder="Asosiy faol moddalar, vergul bilan" {...register('ingredients')} />
            </Field>
          </div>
        </Card>

        <Card
          title="Variantlar va narx"
          actions={
            <Button size="sm" variant="secondary" icon="plus" disabled={variants.fields.length >= 6}
              onClick={() => variants.append({ label: '', price: 0, oldPrice: undefined })}>
              Variant
            </Button>
          }
        >
          <div className={styles.variants}>
            {variants.fields.map((field, i) => {
              const e = errors.variants?.[i];
              return (
                <div key={field.id} className={styles.variant}>
                  <Field label="Hajm / rang" error={e?.label?.message}>
                    <Input placeholder="30 ml" {...register(`variants.${i}.label`)} />
                  </Field>
                  <Field label="Narx, so'm" error={e?.price?.message}>
                    <Input type="number" inputMode="numeric" min={0} step={1000} {...register(`variants.${i}.price`)} />
                  </Field>
                  <Field label="Eski narx" error={e?.oldPrice?.message}>
                    <Input type="number" inputMode="numeric" min={0} step={1000} placeholder="—" {...register(`variants.${i}.oldPrice`)} />
                  </Field>
                  <Button variant="ghost" size="sm" icon="trash" iconOnly className={styles.removeVariant}
                    disabled={variants.fields.length === 1} onClick={() => variants.remove(i)}>
                    Variantni o'chirish
                  </Button>
                </div>
              );
            })}
            {errors.variants?.root?.message && <p className={styles.error}>{errors.variants.root.message}</p>}
          </div>
        </Card>

        <Card title="Qaysi teri turiga mos">
          <Controller
            control={control}
            name="skin"
            render={({ field }) => (
              <div className={styles.chips} role="group" aria-label="Teri turi">
                {SKIN_OPTIONS.map(([key, label]) => {
                  const on = field.value.includes(key);
                  return (
                    <button key={key} type="button" aria-pressed={on} className={cn(styles.chip, on && styles.chipOn)}
                      onClick={() => field.onChange(on ? field.value.filter((k) => k !== key) : [...field.value, key])}>
                      {label}
                    </button>
                  );
                })}
              </div>
            )}
          />
          <p className="muted" style={{ fontSize: '.8rem', marginTop: 10 }}>Makiyaj vositalari uchun bo'sh qoldirish mumkin.</p>
        </Card>
      </div>

      <aside className={styles.side}>
        <Card title="Ko'rinish">
          <ImagePicker control={control} />
          {serverErrors?.image && <p className={styles.error}>{serverErrors.image}</p>}
          <div className="stack">
            <Field label="Shakl" error={errors.shape?.message}>
              <Select {...register('shape')}>
                {PRODUCT_SHAPES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </Select>
            </Field>
            <div className={styles.colors}>
              {COLOR_FIELDS.map(({ name, label }) => (
                <Controller
                  key={name}
                  control={control}
                  name={name}
                  render={({ field }) => (
                    <Field label={label} error={errors[name]?.message}>
                      <Input type="color" {...field} />
                    </Field>
                  )}
                />
              ))}
            </div>
          </div>
        </Card>

        <Card title="Ombor va holat">
          <div className="stack">
            <Field label="Qoldiq (dona)" error={errors.stock?.message}>
              <Input type="number" inputMode="numeric" min={0} {...register('stock')} />
            </Field>
            <Controller
              control={control}
              name="isActive"
              render={({ field }) => <Switch checked={field.value} onChange={field.onChange} label="Saytda ko'rinadi" />}
            />
          </div>
        </Card>

        <div className={styles.actions}>
          <ButtonLink to="/products" variant="ghost">Bekor qilish</ButtonLink>
          <Button type="submit" loading={submitting} disabled={requireDirty && !isDirty}>{submitText}</Button>
        </div>
      </aside>
    </form>
  );
}
