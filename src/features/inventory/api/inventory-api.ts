import { apiClient } from '@/lib/api/client';
import { throwApiErrorFromResponse } from '@/lib/api/throw-api-error';
import type {
  AdjustStockDto,
  InventoryListFilters,
  InventoryListItemResponseDto,
  InventoryStockResponseDto,
  PaginatedInventoryResponseDto,
} from '@/features/inventory/types';
import { normalizeInventoryListFilters } from '@/features/inventory/lib/inventory-list-filters';

export async function listInventoryRequest(
  filters: Partial<InventoryListFilters>,
): Promise<PaginatedInventoryResponseDto> {
  const query = normalizeInventoryListFilters(filters);

  const { data, error, response } = await apiClient.GET('/v1/inventory', {
    params: {
      query: {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        ...(query.sku ? { sku: query.sku } : {}),
        ...(query.productTitle ? { productTitle: query.productTitle } : {}),
        ...(query.lowStockOnly ? { lowStockOnly: true } : {}),
      },
    },
  });

  if (error || !response.ok || !data) {
    return await throwApiErrorFromResponse(response, 'Failed to load inventory');
  }

  return data;
}

/**
 * Inventory for a product. API returns HTTP 200 with `null` when no stock row exists.
 */
export async function getInventoryRequest(
  productId: number,
): Promise<InventoryListItemResponseDto | null> {
  const { data, error, response } = await apiClient.GET(
    '/v1/inventory/products/{productId}',
    {
      params: { path: { productId } },
    },
  );

  if (error || !response.ok) {
    return await throwApiErrorFromResponse(
      response,
      'Failed to load inventory details',
    );
  }

  return data ?? null;
}

export async function adjustStockRequest(
  productId: number,
  body: AdjustStockDto,
): Promise<InventoryStockResponseDto> {
  const { data, error, response } = await apiClient.POST(
    '/v1/inventory/products/{productId}/adjust',
    {
      params: { path: { productId } },
      body,
    },
  );

  if (error || !response.ok || !data) {
    return await throwApiErrorFromResponse(response, 'Failed to adjust stock');
  }

  return data;
}
