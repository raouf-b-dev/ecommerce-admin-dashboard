// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: AGPL-3.0-only

import type { components } from '@/lib/api/generated/schema';
import type { DashboardPeriodDays } from '@/lib/query-keys/dashboard-keys';

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

export type DashboardPeriod = {
  days: DashboardPeriodDays;
  from: string;
  to: string;
};
