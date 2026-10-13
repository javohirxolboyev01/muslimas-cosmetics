import { useListParams } from '@/shared/hooks/useListParams';
import { formatMoney, formatNumber } from '@/shared/lib/format';
import { ButtonLink, Card, ErrorState, FilterTabs, PageHeader, Skeleton, StatCard, type TabOption } from '@/shared/ui';
import type { DashboardPeriod } from '../api';
import { LowStock } from '../components/LowStock';
import { RecentOrders } from '../components/RecentOrders';
import { RevenueChart } from '../components/RevenueChart';
import { StatusBreakdown } from '../components/StatusBreakdown';
import { TopProducts } from '../components/TopProducts';
import { useDashboard } from '../queries';
import styles from './DashboardPage.module.css';

const DEFAULTS = { days: '7' };
const PERIODS: TabOption<string>[] = [
  { value: '7', label: '7 kun' },
  { value: '30', label: '30 kun' },
  { value: '90', label: '90 kun' },
];

const delta = (cur: number, prev: number) => (prev ? ((cur - prev) / prev) * 100 : null);

const ListSkeleton = () => (
  <div className="stack">{[1, 2, 3, 4].map((i) => <Skeleton key={i} height={36} />)}</div>
);

export default function DashboardPage() {
  const [params, setParams] = useListParams(DEFAULTS);
  const days = (Number(params.days) || 7) as DashboardPeriod;
  const { data, isPending, isFetching, isPlaceholderData, error, refetch, isRefetching } = useDashboard(days);

  return (
    <>
      <PageHeader
        title="Boshqaruv paneli"
        description="Do'kon faoliyati bir qarashda"
        actions={<FilterTabs label="Davr" options={PERIODS} value={String(days)} onChange={(d) => setParams({ days: d })} />}
      />

      {error && !data ? (
        <Card><ErrorState error={error} onRetry={refetch} retrying={isRefetching} /></Card>
      ) : (
        <div className={styles.page} data-fetching={isFetching && isPlaceholderData}>
          <div className={styles.stats}>
            <StatCard label="Tushum" icon="trendUp" tint="pink" loading={isPending}
              value={data && formatMoney(data.revenue)} delta={data && delta(data.revenue, data.revenuePrev)} />
            <StatCard label="Buyurtmalar" icon="receipt" tint="lilac" loading={isPending}
              value={data && formatNumber(data.orders)} delta={data && delta(data.orders, data.ordersPrev)} />
            <StatCard label="O'rtacha chek" icon="ticket" tint="butter" loading={isPending}
              value={data && formatMoney(data.avgOrder)} />
            <StatCard label="Mijozlar" icon="users" tint="mint" loading={isPending}
              value={data && formatNumber(data.customers)} />
          </div>

          <div className={styles.row}>
            <Card title="Kunlik tushum" className={styles.chart}>
              {data ? <RevenueChart series={data.series} /> : <Skeleton height={240} />}
            </Card>
            <Card title="Buyurtma holatlari">
              {data ? <StatusBreakdown counts={data.statusCounts} /> : <ListSkeleton />}
            </Card>
          </div>

          <div className={styles.row3}>
            <Card title="So'nggi buyurtmalar" actions={<ButtonLink to="/orders" variant="ghost" size="sm">Hammasi</ButtonLink>}>
              {data ? <RecentOrders orders={data.recentOrders} /> : <ListSkeleton />}
            </Card>
            <Card title="Eng ko'p sotilgan">
              {data ? <TopProducts items={data.topProducts} /> : <ListSkeleton />}
            </Card>
            <Card title="Kam qolgan mahsulotlar"
              actions={<ButtonLink to="/products?status=low" variant="ghost" size="sm">Hammasi</ButtonLink>}>
              {data ? <LowStock items={data.lowStock} /> : <ListSkeleton />}
            </Card>
          </div>
        </div>
      )}
    </>
  );
}
