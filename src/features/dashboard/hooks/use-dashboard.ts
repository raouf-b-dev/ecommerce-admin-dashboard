import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  getAnalyticsOverviewRequest,
  getInventoryAlertsRequest,
  getPaymentsTimeSeriesRequest,
  getTopProductsRequest,
} from '@/features/dashboard/api/dashboard-api';
import { listOrdersRequest } from '@/features/orders/api/orders-api';
import type { DashboardPeriodDays } from '@/features/dashboard/types';
import { buildDashboardPeriod } from '@/features/dashboard/lib/dashboard-metrics';

const DASHBOARD_STALE_MS = 45_000;

/** Stable bucket for series: day for 7/30, week for 90. */
function seriesBucket(days: DashboardPeriodDays): 'day' | 'week' {
  return days <= 30 ? 'day' : 'week';
}

/**
 * Query keys use `days` only — never wall-clock ISO strings.
 * Computing `from`/`to` inside queryFn avoids refetch storms when `new Date()`
 * changes every render (which previously exhausted the API throttle).
 */
export function useDashboardOverviewQuery(
  days: DashboardPeriodDays,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ['dashboard', 'overview', days],
    queryFn: () => {
      const period = buildDashboardPeriod(days);
      return getAnalyticsOverviewRequest({
        from: period.from,
        to: period.to,
      });
    },
    enabled,
    staleTime: DASHBOARD_STALE_MS,
    placeholderData: keepPreviousData,
  });
}

export function useDashboardRevenueSeriesQuery(
  days: DashboardPeriodDays,
  enabled: boolean,
) {
  const bucket = seriesBucket(days);
  return useQuery({
    queryKey: ['dashboard', 'payments-series', days, bucket],
    queryFn: () => {
      const period = buildDashboardPeriod(days);
      return getPaymentsTimeSeriesRequest({
        from: period.from,
        to: period.to,
        bucket,
      });
    },
    enabled,
    staleTime: DASHBOARD_STALE_MS,
    placeholderData: keepPreviousData,
  });
}

export function useDashboardTopProductsQuery(
  days: DashboardPeriodDays,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ['dashboard', 'top-products', days],
    queryFn: () => {
      const period = buildDashboardPeriod(days);
      return getTopProductsRequest({
        from: period.from,
        to: period.to,
        limit: 5,
      });
    },
    enabled,
    staleTime: DASHBOARD_STALE_MS,
    placeholderData: keepPreviousData,
  });
}

export function useDashboardInventoryAlertsQuery(enabled: boolean) {
  return useQuery({
    queryKey: ['dashboard', 'inventory-alerts'],
    queryFn: () => getInventoryAlertsRequest({ limit: 20 }),
    enabled,
    staleTime: DASHBOARD_STALE_MS,
  });
}

export function useDashboardRecentOrdersQuery(enabled: boolean) {
  return useQuery({
    queryKey: ['dashboard', 'recent-orders'],
    queryFn: () =>
      listOrdersRequest({
        page: 1,
        limit: 5,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      }),
    enabled,
    staleTime: DASHBOARD_STALE_MS,
  });
}
