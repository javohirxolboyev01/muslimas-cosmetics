import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { getErrorMessage, isApiError } from '@/shared/api/ApiError';
import type { Category } from '@/shared/types';
import { Button, Field, Input, Modal, useToast } from '@/shared/ui';
import { useSaveCategory } from '../queries';

const schema = z.object({
  id: z.string().trim().min(2, 'Kamida 2 belgi').regex(/^[a-z0-9-]+$/, "Faqat kichik lotin harflari, raqam va '-'"),
  name: z.string().trim().min(2, 'Kamida 2 belgi').max(40),
  emoji: z.string().trim().min(1, 'Emoji kiriting').max(8),
  bg: z.string().regex(/^#[0-9a-f]{6}$/i, 'HEX rang'),
});
type Values = z.infer<typeof schema>;

const EMPTY: Values = { id: '', name: '', emoji: '✨', bg: '#ffe4ee' };

interface Props {
  open: boolean;
  category?: Category;
  onClose: () => void;
}

export function CategoryFormModal({ open, category, onClose }: Props) {
  const toast = useToast();
  const isEdit = !!category;
  const save = useSaveCategory(isEdit ? 'update' : 'create');
  const { register, handleSubmit, reset, setError, formState: { errors, isDirty } } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (open) {
      reset(category ?? EMPTY);
      save.reset();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, category]);

  const submit = handleSubmit((values) => {
    if (save.isPending) return;
    save.mutate(values, {
      onSuccess: () => {
        toast.success(isEdit ? 'Toifa yangilandi' : "Toifa qo'shildi");
        onClose();
      },
      onError: (e) => {
        if (isApiError(e) && e.details) {
          Object.entries(e.details).forEach(([k, m]) => setError(k as keyof Values, { message: m }));
        } else toast.error(getErrorMessage(e));
      },
    });
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Toifani tahrirlash' : 'Yangi toifa'}
      locked={save.isPending}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={save.isPending}>Bekor qilish</Button>
          <Button type="submit" form="category-form" loading={save.isPending} disabled={isEdit && !isDirty}>
            {isEdit ? 'Saqlash' : "Qo'shish"}
          </Button>
        </>
      }
    >
      <form id="category-form" className="stack" onSubmit={submit} noValidate>
        <Field label="Nomi" error={errors.name?.message}><Input {...register('name')} placeholder="Masalan: Serum" /></Field>
        <Field label="ID (URL uchun)" error={errors.id?.message} hint={isEdit ? "ID'ni o'zgartirib bo'lmaydi" : 'Masalan: serum'}>
          <Input {...register('id')} disabled={isEdit} />
        </Field>
        <div className="grid-2">
          <Field label="Emoji" error={errors.emoji?.message}><Input {...register('emoji')} /></Field>
          <Field label="Fon rangi" error={errors.bg?.message}><Input type="color" {...register('bg')} /></Field>
        </div>
      </form>
    </Modal>
  );
}
