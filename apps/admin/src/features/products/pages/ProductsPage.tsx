import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCategoryNames } from '@/features/categories/queries';
import { getErrorMessage } from '@/shared/api/ApiError';
import { PAGE_SIZE } from '@/shared/config/constants';
import { useListParams } from '@/shared/hooks/useListParams';
import type { Product } from '@/shared/types';
import {
  Badge, Button, ButtonLink, Card, ConfirmDialog, DataTable, EmptyState, ErrorState, PageHeader, Pagination,
  ProductThumb, Switch, useToast, type Column,
} from '@/shared/ui';
import type { ProductSort, ProductStatusFilter } from '../api';
import { ProductsToolbar } from '../components/ProductsToolbar';
import { priceRange, stockInfo } from '../lib';
import { useDeleteProduct, usePrefetchProduct, useProducts, useToggleProductActive } from '../queries';
import styles from './ProductsPage.module.css';

const DEFAULTS = { search: '', categoryId: '', status: 'all', sort: 'newest' };

export default function ProductsPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [params, setParams] = useListParams(DEFAULTS);
  const filters = {
    ...params,
    status: params.status as ProductStatusFilter,
    sort: params.sort as ProductSort,
    pageSize: PAGE_SIZE,
  };

  const { data, isPending, isFetching, isPlaceholderData, error, refetch, isRefetching } = useProducts(filters);
  const categoryNames = useCategoryNames();
  const prefetch = usePrefetchProduct();
  // RQ v5'da mutate funksiyasi barqaror — useMemo'ni buzmaydi
  const { mutate: toggleActive } = useToggleProductActive();
  const remove = useDeleteProduct();
  const [toDelete, setToDelete] = useState<Product | null>(null);

  const columns = useMemo<Column<Product>[]>(() => [
    {
      key: 'product',
      header: 'Mahsulot',
      mobile: 'primary',
      cell: (p) => (
        <div className={styles.product}>
          <ProductThumb product={p} size={44} />
          <div className={styles.productText}>
            <strong>{p.name}</strong>
            <span>{categoryNames[p.categoryId] ?? p.categoryId}{p.tag && <> · <Badge tone="pink">{p.tag}</Badge></>}</span>
          </div>
        </div>
      ),
    },
    { key: 'price', header: 'Narx', cell: (p) => <span className="money">{priceRange(p)}</span> },
    {
      key: 'stock',
      header: 'Qoldiq',
      cell: (p) => {
        const s = stockInfo(p.stock);
        return <Badge tone={s.tone} dot>{s.label}</Badge>;
      },
    },
    {
      key: 'active',
      header: 'Saytda',
      cell: (p) => (
        // Qator bosilishi (tahrirlash) bilan aralashmasin
        <span onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          <Switch
            checked={p.isActive}
            hideLabel
            label={`${p.name} saytda ko'rinadi`}
            onChange={(isActive) =>
              toggleActive({ id: p.id, isActive }, { onError: (e) => toast.error(getErrorMessage(e)) })
            }
          />
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      mobile: 'actions',
      cell: (p) => (
        <div className={styles.actions} onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
          <ButtonLink to={`/products/${p.id}/edit`} variant="ghost" size="sm" icon="edit">Tahrirlash</ButtonLink>
          <Button variant="ghost" size="sm" icon="trash" iconOnly onClick={() => setToDelete(p)}>O'chirish</Button>
        </div>
      ),
    },
  ], [categoryNames, toggleActive, toast]);

  const confirmDelete = () => {
    if (!toDelete || remove.isPending) return;
    remove.mutate(toDelete.id, {
      onSuccess: () => {
        toast.success(`"${toDelete.name}" o'chirildi`);
        setToDelete(null);
      },
      onError: (e) => toast.error(getErrorMessage(e)),
    });
  };

  const hasFilters = params.search || params.categoryId || params.status !== 'all';

  return (
    <>
      <PageHeader
        title="Mahsulotlar"
        description={data ? `Jami ${data.total} ta mahsulot` : 'Katalogni boshqarish'}
        actions={<ButtonLink to="/products/new" icon="plus">Yangi mahsulot</ButtonLink>}
      />

      <Card flush>
        <ProductsToolbar filters={filters} onChange={setParams} />
        {error && !data ? (
          <ErrorState error={error} onRetry={refetch} retrying={isRefetching} />
        ) : (
          <>
            <DataTable
              caption="Mahsulotlar ro'yxati"
              columns={columns}
              rows={data?.items}
              rowKey={(p) => p.id}
              loading={isPending}
              fetching={isFetching && isPlaceholderData}
              onRowClick={(p) => navigate(`/products/${p.id}/edit`)}
              onRowHover={prefetch}
              empty={
                <EmptyState
                  emoji="🔍"
                  title={hasFilters ? 'Hech narsa topilmadi' : "Hali mahsulot yo'q"}
                  description={hasFilters ? "Filtrlarni o'zgartirib ko'ring." : "Birinchi mahsulotni qo'shing."}
                  action={hasFilters
                    ? <Button variant="secondary" onClick={() => setParams(DEFAULTS)}>Filtrlarni tozalash</Button>
                    : <ButtonLink to="/products/new" icon="plus">Mahsulot qo'shish</ButtonLink>}
                />
              }
            />
            {data && (
              <Pagination
                page={data.page}
                pageCount={data.pageCount}
                pageSize={data.pageSize}
                total={data.total}
                disabled={isPlaceholderData}
                onChange={(page) => setParams({ page })}
              />
            )}
          </>
        )}
      </Card>

      <ConfirmDialog
        open={!!toDelete}
        title="Mahsulotni o'chirish"
        message={<>"{toDelete?.name}" butunlay o'chiriladi. Bu amalni qaytarib bo'lmaydi.</>}
        confirmText="O'chirish"
        loading={remove.isPending}
        onConfirm={confirmDelete}
        onClose={() => setToDelete(null)}
      />
    </>
  );
}
