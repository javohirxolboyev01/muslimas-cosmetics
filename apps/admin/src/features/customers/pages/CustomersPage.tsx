import { useNavigate } from 'react-router-dom';
import { PAGE_SIZE } from '@/shared/config/constants';
import { useListParams } from '@/shared/hooks/useListParams';
import { formatDate, formatMoney } from '@/shared/lib/format';
import { phoneDigits } from '@/shared/lib/phone';
import type { Customer } from '@/shared/types';
import {
  Badge, Card, DataTable, EmptyState, ErrorState, PageHeader, Pagination, SearchInput, Select, type Column,
} from '@/shared/ui';
import type { CustomerSort } from '../api';
import { useCustomers } from '../queries';
import styles from './CustomersPage.module.css';

const DEFAULTS = { search: '', sort: 'spent' };

const initials = (name: string) => name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

const COLUMNS: Column<Customer>[] = [
  {
    key: 'name',
    header: 'Mijoz',
    mobile: 'primary',
    cell: (c) => (
      <div className={styles.person}>
        <span className={styles.avatar} aria-hidden="true">{initials(c.name)}</span>
        <div>
          <strong>{c.name}</strong>
          <small>{c.phone}</small>
        </div>
      </div>
    ),
  },
  { key: 'region', header: 'Hudud', cell: (c) => c.region },
  {
    key: 'orders',
    header: 'Buyurtmalar',
    align: 'center',
    cell: (c) => (c.ordersCount >= 5 ? <Badge tone="pink">⭐ {c.ordersCount}</Badge> : c.ordersCount),
  },
  { key: 'spent', header: 'Jami xarid', align: 'right', cell: (c) => <span className="money">{formatMoney(c.totalSpent)}</span> },
  { key: 'last', header: 'Oxirgi buyurtma', mobile: 'hidden', cell: (c) => formatDate(c.lastOrderAt) },
];

export default function CustomersPage() {
  const navigate = useNavigate();
  const [params, setParams] = useListParams(DEFAULTS);
  const { data, isPending, isFetching, isPlaceholderData, error, refetch, isRefetching } = useCustomers({
    search: params.search,
    sort: params.sort as CustomerSort,
    page: params.page,
    pageSize: PAGE_SIZE,
  });

  return (
    <>
      <PageHeader title="Mijozlar" description="Buyurtmalar asosida shakllangan mijozlar bazasi" />
      <Card flush>
        <div className={styles.toolbar}>
          <SearchInput value={params.search} onSearch={(search) => setParams({ search })} placeholder="Ism, telefon yoki hudud…" label="Mijoz qidirish" />
          <Select aria-label="Saralash" value={params.sort} onChange={(e) => setParams({ sort: e.target.value })}>
            <option value="spent">Ko'p xarid qilganlar</option>
            <option value="orders">Ko'p buyurtma berganlar</option>
            <option value="recent">Yaqinda buyurtma berganlar</option>
          </Select>
        </div>
        {error && !data ? (
          <ErrorState error={error} onRetry={refetch} retrying={isRefetching} />
        ) : (
          <>
            <DataTable
              caption="Mijozlar ro'yxati"
              columns={COLUMNS}
              rows={data?.items}
              rowKey={(c) => c.phone}
              loading={isPending}
              fetching={isFetching && isPlaceholderData}
              // Mijozning buyurtmalariga o'tish (telefon bo'yicha qidiruv)
              onRowClick={(c) => navigate(`/orders?search=${phoneDigits(c.phone)}`)}
              empty={<EmptyState emoji="👥" title="Mijoz topilmadi" />}
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
