import { apiClient } from '@/lib/api/client';
import {
  readApiErrorFromResponse,
  toApiRequestError,
} from '@/lib/api/parse-api-error';
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
    const parsed = response ? await readApiErrorFromResponse(response) : null;
    if (response?.status === 429) {
      throw toApiRequestError(response, {
        statusCode: 429,
        message: 'Too many requests. Wait a moment and try again.',
        code: parsed?.code,
      }, 'Too many requests. Wait a moment and try again.');
    }
    throw toApiRequestError(
      response ?? new Response(null, { status: 500 }),
      parsed,
      'Failed to load inventory',
    );
  }

  return data;
}

export async function getInventoryRequest(
  productId: number,
): Promise<InventoryListItemResponseDto> {
  const { data, error, response } = await apiClient.GET(
    '/v1/inventory/products/{productId}',
    {
      params: { path: { productId } },
    },
  );

  if (error || !response.ok || !data) {
    const parsed = response ? await readApiErrorFromResponse(response) : null;
    throw toApiRequestError(
      response ?? new Response(null, { status: 500 }),
      parsed,
      'Failed to load inventory details',
    );
  }

  return data;
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
    const parsed = response ? await readApiErrorFromResponse(response) : null;
    throw toApiRequestError(
      response ?? new Response(null, { status: 500 }),
      parsed,
      'Failed to adjust stock',
    );
  }

  return data;
}
