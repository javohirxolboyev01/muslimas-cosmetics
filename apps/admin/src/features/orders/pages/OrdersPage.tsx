import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { DELIVERY_LABELS, ORDER_STATUS, PAGE_SIZE } from '@/shared/config/constants';
import { useListParams } from '@/shared/hooks/useListParams';
import { formatDateTime, formatMoney } from '@/shared/lib/format';
import type { DeliveryMethod, Order, OrderStatus } from '@/shared/types';
import {
  Button, Card, DataTable, EmptyState, ErrorState, FilterTabs, PageHeader, Pagination, SearchInput, Select,
  type Column, type TabOption,
} from '@/shared/ui';
import { OrderStatusBadge } from '../components/OrderStatusBadge';
import { useOrders, useOrderStatusCounts } from '../queries';
import styles from './OrdersPage.module.css';

const DEFAULTS = { search: '', status: '', delivery: '' };

const COLUMNS: Column<Order>[] = [
  {
    key: 'no',
    header: 'Buyurtma',
    mobile: 'primary',
    cell: (o) => (
      <div className={styles.no}>
        <strong>{o.no}</strong>
        <span>{formatDateTime(o.date)}</span>
      </div>
    ),
  },
  {
    key: 'customer',
    header: 'Mijoz',
    cell: (o) => (
      <div className={styles.customer}>
        <span>{o.name}</span>
        <small>{o.phone}</small>
      </div>
    ),
  },
  { key: 'region', header: 'Hudud', mobile: 'hidden', cell: (o) => o.region },
  { key: 'items', header: 'Mahsulot', mobile: 'hidden', align: 'center', cell: (o) => o.items.reduce((s, x) => s + x.qty, 0) },
  { key: 'total', header: 'Summa', align: 'right', cell: (o) => <span className="money">{formatMoney(o.total)}</span> },
  { key: 'status', header: 'Holat', cell: (o) => <OrderStatusBadge status={o.status} /> },
];

export default function OrdersPage() {
  const navigate = useNavigate();
  const [params, setParams] = useListParams(DEFAULTS);
  const filters = {
    ...params,
    status: params.status as OrderStatus | '',
    delivery: params.delivery as DeliveryMethod | '',
    pageSize: PAGE_SIZE,
  };
  const { data, isPending, isFetching, isPlaceholderData, error, refetch, isRefetching } = useOrders(filters);
  const { data: counts } = useOrderStatusCounts();

  const tabs = useMemo<TabOption<string>[]>(() => {
    const total = counts ? Object.values(counts).reduce((s, n) => s + (n ?? 0), 0) : undefined;
    return [
      { value: '', label: 'Barchasi', count: total },
      ...(Object.keys(ORDER_STATUS) as OrderStatus[]).map((s) => ({
        value: s, label: ORDER_STATUS[s].label, count: counts?.[s] ?? (counts ? 0 : undefined),
      })),
    ];
  }, [counts]);

  const hasFilters = params.search || params.status || params.delivery;

  return (
    <>
      <PageHeader title="Buyurtmalar" description="Saytdan kelgan buyurtmalarni kuzatish va holatini yangilash" />

      <div className={styles.tabs}>
        <FilterTabs label="Holat bo'yicha" options={tabs} value={params.status} onChange={(status) => setParams({ status })} />
      </div>

      <Card flush>
        <div className={styles.toolbar}>
          <SearchInput
            value={params.search}
            onSearch={(search) => setParams({ search })}
            placeholder="Raqam, ism yoki telefon…"
            label="Buyurtma qidirish"
          />
          <Select aria-label="Yetkazish usuli" value={params.delivery} onChange={(e) => setParams({ delivery: e.target.value })}>
            <option value="">Barcha yetkazish usullari</option>
            {Object.entries(DELIVERY_LABELS).map(([k, l]) => <option key={k} value={k}>{l}</option>)}
          </Select>
        </div>

        {error && !data ? (
          <ErrorState error={error} onRetry={refetch} retrying={isRefetching} />
        ) : (
          <>
            <DataTable
              caption="Buyurtmalar ro'yxati"
              columns={COLUMNS}
              rows={data?.items}
              rowKey={(o) => o.no}
              loading={isPending}
              fetching={isFetching && isPlaceholderData}
              onRowClick={(o) => navigate(`/orders/${o.no}`)}
              empty={
                <EmptyState
                  emoji="📦"
                  title="Buyurtma topilmadi"
                  description={hasFilters ? "Qidiruv yoki filtrlarni o'zgartiring." : 'Hali buyurtma kelmagan.'}
                  action={hasFilters && <Button variant="secondary" onClick={() => setParams(DEFAULTS)}>Filtrlarni tozalash</Button>}
                />
              }
            />
            {data && (
              <Pagination page={data.page} pageCount={data.pageCount} pageSize={data.pageSize} total={data.total}
                disabled={isPlaceholderData} onChange={(page) => setParams({ page })} />
            )}
          </>
        )}
      </Card>
    </>
  );
}
