import { Link, useSearchParams } from 'react-router';
import { PageHeader } from '@/components/layout/page-header';
import { Label } from '@/components/ui/label';
import { DashboardAttentionList } from '@/features/dashboard/components/dashboard-attention-list';
import { DashboardLowStockTable } from '@/features/dashboard/components/dashboard-low-stock-table';
import { DashboardRecentOrders } from '@/features/dashboard/components/dashboard-recent-orders';
import { DashboardRevenueChart } from '@/features/dashboard/components/dashboard-revenue-chart';
import { DashboardSummaryCards } from '@/features/dashboard/components/dashboard-summary-cards';
import { DashboardTopProducts } from '@/features/dashboard/components/dashboard-top-products';
import { DashboardWidgetFrame } from '@/features/dashboard/components/dashboard-widget-frame';
import {
  useDashboardInventoryAlertsQuery,
  useDashboardOverviewQuery,
  useDashboardRecentOrdersQuery,
  useDashboardRevenueSeriesQuery,
  useDashboardTopProductsQuery,
} from '@/features/dashboard/hooks/use-dashboard';
import type { DashboardPeriodDays } from '@/features/dashboard/types';
import { useAuth } from '@/lib/auth/auth-context';

const PERIOD_OPTIONS: { value: DashboardPeriodDays; label: string }[] = [
  { value: 7, label: '7 days' },
  { value: 30, label: '30 days' },
  { value: 90, label: '90 days' },
];

function parseDaysParam(raw: string | null): DashboardPeriodDays {
  const n = Number(raw);
  if (n === 7 || n === 30 || n === 90) {
    return n;
  }
  return 7;
}

export function DashboardPage() {
  const { hasPermission } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const days = parseDaysParam(searchParams.get('days'));

  const canOrders = hasPermission('view_all_orders');
  const canPayments = hasPermission('view_all_payments');
  const canInventory = hasPermission('view_all_inventory');

  const overviewQuery = useDashboardOverviewQuery(days, canOrders);
  const seriesQuery = useDashboardRevenueSeriesQuery(days, canPayments);
  const topProductsQuery = useDashboardTopProductsQuery(days, canOrders);
  const alertsQuery = useDashboardInventoryAlertsQuery(canInventory);
  const recentOrdersQuery = useDashboardRecentOrdersQuery(canOrders);

  const chartCurrency =
    seriesQuery.data?.buckets.find((b) => b.currency)?.currency ??
    overviewQuery.data?.current.currency;
  const topProductsCurrency = overviewQuery.data?.current.currency;

  function setDays(next: DashboardPeriodDays) {
    const params = new URLSearchParams(searchParams);
    if (next === 7) {
      params.delete('days');
    } else {
      params.set('days', String(next));
    }
    setSearchParams(params, { replace: true });
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Operational pulse: revenue, orders needing attention, and stock alerts."
      >
        <div className="space-y-2">
          <Label htmlFor="dashboard-period">Period</Label>
          <select
            id="dashboard-period"
            className="flex h-10 w-36 rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={days}
            onChange={(e) =>
              setDays(Number(e.target.value) as DashboardPeriodDays)
            }
          >
            {PERIOD_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </PageHeader>

      {canOrders ? (
        <DashboardWidgetFrame
          title="Summary"
          isLoading={overviewQuery.isLoading && !overviewQuery.data}
          isError={overviewQuery.isError}
          error={overviewQuery.error}
          onRetry={() => void overviewQuery.refetch()}
        >
          {overviewQuery.data ? (
            <div className="space-y-6">
              <DashboardSummaryCards
                current={overviewQuery.data.current}
                previous={overviewQuery.data.previous}
                lowStockCount={overviewQuery.data.lowStockCount}
                showLowStock={canInventory}
              />
              <div className="space-y-3">
                <h3 className="text-sm font-medium">Needs attention</h3>
                <DashboardAttentionList
                  items={overviewQuery.data.ordersNeedingAttention}
                />
              </div>
            </div>
          ) : null}
        </DashboardWidgetFrame>
      ) : null}

      {canPayments ? (
        <DashboardWidgetFrame
          title="Net revenue"
          isLoading={seriesQuery.isLoading && !seriesQuery.data}
          isError={seriesQuery.isError}
          error={seriesQuery.error}
          onRetry={() => void seriesQuery.refetch()}
        >
          {seriesQuery.data && chartCurrency ? (
            <DashboardRevenueChart
              buckets={seriesQuery.data.buckets}
              currency={chartCurrency}
              bucket={days <= 30 ? 'day' : 'week'}
            />
          ) : seriesQuery.data ? (
            <p className="text-sm text-muted-foreground">
              No currency on payment series yet.
            </p>
          ) : null}
        </DashboardWidgetFrame>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        {canOrders ? (
          <DashboardWidgetFrame
            title="Top products"
            isLoading={topProductsQuery.isLoading && !topProductsQuery.data}
            isError={topProductsQuery.isError}
            error={topProductsQuery.error}
            onRetry={() => void topProductsQuery.refetch()}
          >
            {topProductsQuery.data && topProductsCurrency ? (
              <DashboardTopProducts
                items={topProductsQuery.data.items}
                currency={topProductsCurrency}
              />
            ) : topProductsQuery.data ? (
              <p className="text-sm text-muted-foreground">
                Revenue currency unavailable until overview loads.
              </p>
            ) : null}
          </DashboardWidgetFrame>
        ) : null}

        {canInventory ? (
          <DashboardWidgetFrame
            title="Low stock"
            action={
              <Link
                to="/inventory?lowStockOnly=true"
                className="text-sm text-primary underline-offset-4 hover:underline"
              >
                View inventory
              </Link>
            }
            isLoading={alertsQuery.isLoading && !alertsQuery.data}
            isError={alertsQuery.isError}
            error={alertsQuery.error}
            onRetry={() => void alertsQuery.refetch()}
          >
            {alertsQuery.data ? (
              <DashboardLowStockTable items={alertsQuery.data.items} />
            ) : null}
          </DashboardWidgetFrame>
        ) : null}
      </div>

      {canOrders ? (
        <DashboardWidgetFrame
          title="Recent orders"
          action={
            <Link
              to="/orders"
              className="text-sm text-primary underline-offset-4 hover:underline"
            >
              View all orders
            </Link>
          }
          isLoading={recentOrdersQuery.isLoading && !recentOrdersQuery.data}
          isError={recentOrdersQuery.isError}
          error={recentOrdersQuery.error}
          onRetry={() => void recentOrdersQuery.refetch()}
        >
          {recentOrdersQuery.data ? (
            <DashboardRecentOrders items={recentOrdersQuery.data.items} />
          ) : null}
        </DashboardWidgetFrame>
      ) : null}

      <p className="text-xs text-muted-foreground">
        Metrics use server analytics aggregates (UTC). Revenue includes
        CAPTURED, COMPLETED, PARTIALLY_REFUNDED, and REFUNDED payments (net =
        gross − refunded). Not Prometheus / Grafana.
      </p>
    </div>
  );
}
