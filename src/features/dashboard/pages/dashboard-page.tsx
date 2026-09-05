import { useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { PageHeader } from '@/components/layout/page-header';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { DashboardAttentionList } from '@/features/dashboard/components/dashboard-attention-list';
import { DashboardLowStockList } from '@/features/dashboard/components/dashboard-low-stock-list';
import { DashboardRecentOrders } from '@/features/dashboard/components/dashboard-recent-orders';
import {
  DashboardRevenueChart,
  type ChartMetric,
} from '@/features/dashboard/components/dashboard-revenue-chart';
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

function DashboardPage() {
  const { hasPermission } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const days = parseDaysParam(searchParams.get('days'));
  const [chartMetric, setChartMetric] = useState<ChartMetric>('netAmount');

  const chartTitle =
    chartMetric === 'grossAmount'
      ? 'Gross revenue'
      : chartMetric === 'refundedAmount'
        ? 'Refunds'
        : chartMetric === 'capturedCount'
          ? 'Captured payments'
          : 'Net revenue';

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
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Operational pulse: revenue, orders needing attention, and stock alerts."
      >
        <SegmentedControl
          options={PERIOD_OPTIONS}
          value={days}
          onChange={setDays}
          ariaLabel="Dashboard period selector"
        />
      </PageHeader>

      {/* Row 1: Overview KPI Cards */}
      {canOrders ? (
        <DashboardWidgetFrame
          title="Summary"
          isLoading={overviewQuery.isLoading && !overviewQuery.data}
          isError={overviewQuery.isError}
          error={overviewQuery.error}
          onRetry={() => void overviewQuery.refetch()}
        >
          {overviewQuery.data ? (
            <DashboardSummaryCards
              current={overviewQuery.data.current}
              previous={overviewQuery.data.previous}
              lowStockCount={overviewQuery.data.lowStockCount}
              showLowStock={canInventory}
            />
          ) : null}
        </DashboardWidgetFrame>
      ) : null}

      {/* Row 2: Core Operations Tier (Chart ~2/3 + Right Rail ~1/3) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {canPayments ? (
          <div className={canOrders || canInventory ? 'lg:col-span-8' : 'lg:col-span-12'}>
            <DashboardWidgetFrame
              title={chartTitle}
              isLoading={seriesQuery.isLoading && !seriesQuery.data}
              isError={seriesQuery.isError}
              error={seriesQuery.error}
              onRetry={() => void seriesQuery.refetch()}
            >
              {seriesQuery.data && chartCurrency ? (
                <DashboardRevenueChart
                  metric={chartMetric}
                  onMetricChange={setChartMetric}
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
          </div>
        ) : null}

        {canOrders || canInventory ? (
          <div className={canPayments ? 'space-y-6 lg:col-span-4' : 'space-y-6 lg:col-span-12'}>
            {canOrders ? (
              <section className="space-y-3" aria-label="Needs attention">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium">Needs attention</h2>
                </div>
                {overviewQuery.data ? (
                  <DashboardAttentionList
                    items={overviewQuery.data.ordersNeedingAttention}
                  />
                ) : overviewQuery.isLoading ? (
                  <p className="text-sm text-muted-foreground">Loading…</p>
                ) : null}
              </section>
            ) : null}

            {canInventory ? (
              <DashboardWidgetFrame
                title="Low stock"
                isLoading={alertsQuery.isLoading && !alertsQuery.data}
                isError={alertsQuery.isError}
                error={alertsQuery.error}
                onRetry={() => void alertsQuery.refetch()}
              >
                {alertsQuery.data ? (
                  <DashboardLowStockList
                    items={alertsQuery.data.items}
                    totalAtRisk={overviewQuery.data?.lowStockCount}
                  />
                ) : null}
              </DashboardWidgetFrame>
            ) : null}
          </div>
        ) : null}
      </div>

      {/* Row 3: Catalog & Activity Tier (Top Products ~1/2 + Recent Orders ~1/2) */}
      <div className="grid gap-6 lg:grid-cols-2">
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

        {canOrders ? (
          <DashboardWidgetFrame
            title="Recent orders"
            action={
              <Link
                to="/orders"
                className="text-xs text-primary underline-offset-4 hover:underline"
              >
                View all orders &rarr;
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
      </div>

      <p className="text-xs text-muted-foreground">
        Metrics use server analytics aggregates (UTC). Revenue includes
        CAPTURED, COMPLETED, PARTIALLY_REFUNDED, and REFUNDED payments (net =
        gross − refunded). Not Prometheus / Grafana.
      </p>
    </div>
  );
}

export { DashboardPage };
export default DashboardPage;
