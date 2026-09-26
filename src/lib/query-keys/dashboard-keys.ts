// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: AGPL-3.0-only

export type DashboardPeriodDays = 7 | 30 | 90;

export const dashboardKeys = {
  all: ['dashboard'] as const,
  overview: (days: DashboardPeriodDays) =>
    [...dashboardKeys.all, 'overview', days] as const,
  paymentsSeries: (days: DashboardPeriodDays, bucket: 'day' | 'week') =>
    [...dashboardKeys.all, 'payments-series', days, bucket] as const,
  topProducts: (days: DashboardPeriodDays) =>
    [...dashboardKeys.all, 'top-products', days] as const,
  inventoryAlerts: () => [...dashboardKeys.all, 'inventory-alerts'] as const,
  recentOrders: () => [...dashboardKeys.all, 'recent-orders'] as const,
};
