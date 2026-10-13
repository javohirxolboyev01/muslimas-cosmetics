import { useState } from 'react';
import { Link } from 'react-router-dom';
import { getErrorMessage } from '@/shared/api/ApiError';
import { useDisclosure } from '@/shared/hooks/useDisclosure';
import type { Category } from '@/shared/types';
import { Button, Card, ConfirmDialog, EmptyState, ErrorState, PageHeader, Skeleton, useToast } from '@/shared/ui';
import type { CategoryWithCount } from '../api';
import { CategoryFormModal } from '../components/CategoryFormModal';
import { useCategories, useDeleteCategory } from '../queries';
import styles from './CategoriesPage.module.css';

export default function CategoriesPage() {
  const toast = useToast();
  const { data, isPending, error, refetch, isRefetching } = useCategories();
  const form = useDisclosure<Category>();
  const remove = useDeleteCategory();
  const [toDelete, setToDelete] = useState<CategoryWithCount | null>(null);

  const confirmDelete = () => {
    if (!toDelete || remove.isPending) return;
    remove.mutate(toDelete.id, {
      onSuccess: () => { toast.success("Toifa o'chirildi"); setToDelete(null); },
      onError: (e) => { toast.error(getErrorMessage(e)); setToDelete(null); },
    });
  };

  return (
    <>
      <PageHeader
        title="Toifalar"
        description="Saytdagi katalog bo'limlari"
        actions={<Button icon="plus" onClick={() => form.open()}>Yangi toifa</Button>}
      />

      {error && !data ? (
        <Card><ErrorState error={error} onRetry={refetch} retrying={isRefetching} /></Card>
      ) : (
        <div className={styles.grid}>
          {isPending && Array.from({ length: 6 }, (_, i) => <Skeleton key={i} height={168} radius={24} />)}
          {data?.map((c) => (
            <article key={c.id} className={styles.card}>
              <span className={styles.ring} style={{ background: c.bg }} aria-hidden="true">{c.emoji}</span>
              <h3 className={styles.name}>{c.name}</h3>
              <Link to={`/products?categoryId=${c.id}`} className={styles.count}>{c.productCount} ta mahsulot →</Link>
              <div className={styles.actions}>
                <Button size="sm" variant="secondary" icon="edit" onClick={() => form.open(c)}>Tahrirlash</Button>
                <Button size="sm" variant="ghost" icon="trash" iconOnly onClick={() => setToDelete(c)}>O'chirish</Button>
              </div>
            </article>
          ))}
          {data?.length === 0 && <Card className={styles.full}><EmptyState title="Toifa yo'q" /></Card>}
        </div>
      )}

      <CategoryFormModal open={form.isOpen} category={form.data} onClose={form.close} />
      <ConfirmDialog
        open={!!toDelete}
        title="Toifani o'chirish"
        message={toDelete?.productCount
          ? `"${toDelete.name}" toifasida ${toDelete.productCount} ta mahsulot bor. Avval ularni boshqa toifaga o'tkazing.`
          : `"${toDelete?.name}" toifasi o'chiriladi.`}
        confirmText="O'chirish"
        loading={remove.isPending}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  );
}
