import type { components } from '@/lib/api/generated/schema';

export type AnalyticsOverviewResponseDto =
  components['schemas']['AnalyticsOverviewResponseDto'];
export type AnalyticsKpiSnapshotDto =
  components['schemas']['AnalyticsKpiSnapshotDto'];
export type OrderAttentionCountDto =
  components['schemas']['OrderAttentionCountDto'];
export type PaymentsTimeSeriesResponseDto =
  components['schemas']['PaymentsTimeSeriesResponseDto'];
export type PaymentTimeSeriesBucketDto =
  components['schemas']['PaymentTimeSeriesBucketDto'];
export type TopProductsResponseDto =
  components['schemas']['TopProductsResponseDto'];
export type TopProductItemDto = components['schemas']['TopProductItemDto'];
export type InventoryAlertsResponseDto =
  components['schemas']['InventoryAlertsResponseDto'];
export type InventoryAlertItemDto =
  components['schemas']['InventoryAlertItemDto'];

export type DashboardPeriodDays = 7 | 30 | 90;

export type DashboardPeriod = {
  days: DashboardPeriodDays;
  from: string;
  to: string;
};
