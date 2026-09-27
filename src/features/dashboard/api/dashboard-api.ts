import { apiClient } from '@/lib/api/client';
import { throwApiErrorFromResponse } from '@/lib/api/throw-api-error';
import { listOrdersRequest } from '@/features/orders/api/orders-api';
import type {
  AnalyticsOverviewResponseDto,
  InventoryAlertsResponseDto,
  PaymentsTimeSeriesResponseDto,
  TopProductsResponseDto,
} from '@/features/dashboard/types';
import type { PaginatedOrdersResponseDto } from '@/features/orders/types';

export async function getAnalyticsOverviewRequest(params: {
  from: string;
  to: string;
}): Promise<AnalyticsOverviewResponseDto> {
  const { data, error, response } = await apiClient.GET(
    '/v1/admin/analytics/overview',
    { params: { query: params } },
  );

  if (error || !response.ok || !data) {
    return await throwApiErrorFromResponse(response, 'Failed to load dashboard overview');
  }

  return data;
}

export async function getPaymentsTimeSeriesRequest(params: {
  from: string;
  to: string;
  bucket: 'day' | 'week';
}): Promise<PaymentsTimeSeriesResponseDto> {
  const { data, error, response } = await apiClient.GET(
    '/v1/admin/analytics/payments/time-series',
    { params: { query: params } },
  );

  if (error || !response.ok || !data) {
    return await throwApiErrorFromResponse(response, 'Failed to load revenue chart');
  }

  return data;
}

export async function getTopProductsRequest(params: {
  from: string;
  to: string;
  limit?: number;
}): Promise<TopProductsResponseDto> {
  const { data, error, response } = await apiClient.GET(
    '/v1/admin/analytics/products/top',
    { params: { query: params } },
  );

  if (error || !response.ok || !data) {
    return await throwApiErrorFromResponse(response, 'Failed to load top products');
  }

  return data;
}

export async function getInventoryAlertsRequest(params?: {
  limit?: number;
}): Promise<InventoryAlertsResponseDto> {
  const { data, error, response } = await apiClient.GET(
    '/v1/admin/analytics/inventory/alerts',
    { params: { query: params ?? {} } },
  );

  if (error || !response.ok || !data) {
    return await throwApiErrorFromResponse(response, 'Failed to load inventory alerts');
  }

  return data;
}

export async function listRecentOrdersForDashboard(): Promise<PaginatedOrdersResponseDto> {
  return listOrdersRequest({
    page: 1,
    limit: 5,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });
}
