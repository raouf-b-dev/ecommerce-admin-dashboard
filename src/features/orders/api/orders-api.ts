import { apiClient } from '@/lib/api/client';
import {
  readApiErrorFromResponse,
  toApiRequestError,
} from '@/lib/api/parse-api-error';
import { throwApiErrorFromResponse } from '@/lib/api/throw-api-error';
import type {
  OrderDetailResponseDto,
  OrderListFilters,
  OrderMutationResponseDto,
  OrderStatusAction,
  PaginatedOrdersResponseDto,
} from '@/features/orders/types';
import { normalizeOrderListFilters } from '@/features/orders/lib/order-list-filters';

export async function listOrdersRequest(
  filters: Partial<OrderListFilters>,
): Promise<PaginatedOrdersResponseDto> {
  const query = normalizeOrderListFilters(filters);
  const { data, error, response } = await apiClient.GET('/v1/orders', {
    params: {
      query: {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
        ...(query.status ? { status: query.status } : {}),
        ...(query.userId ? { userId: query.userId } : {}),
        ...(query.userEmail ? { userEmail: query.userEmail } : {}),
        ...(query.userName ? { userName: query.userName } : {}),
      },
    },
  });

  if (error || !response.ok || !data) {
    return await throwApiErrorFromResponse(response, 'Failed to load orders');
  }

  return data;
}

export async function getOrderRequest(
  orderId: number,
): Promise<OrderDetailResponseDto> {
  const { data, error, response } = await apiClient.GET('/v1/orders/{id}', {
    params: { path: { id: orderId } },
  });

  if (error || !response.ok || !data) {
    const parsed = response ? await readApiErrorFromResponse(response) : null;
    throw toApiRequestError(
      response ?? new Response(null, { status: 500 }),
      parsed,
      'Failed to load order',
    );
  }

  return data;
}

async function patchOrderTransition(
  orderId: number,
  action: OrderStatusAction,
) {
  const pathParams = { path: { id: orderId } };

  switch (action) {
    case 'confirm':
      return apiClient.PATCH('/v1/orders/{id}/confirm', {
        params: pathParams,
      });
    case 'process':
      return apiClient.PATCH('/v1/orders/{id}/process', {
        params: pathParams,
      });
    case 'ship':
      return apiClient.PATCH('/v1/orders/{id}/ship', {
        params: pathParams,
      });
    case 'deliver':
      return apiClient.PATCH('/v1/orders/{id}/deliver', {
        params: pathParams,
        body: {},
      });
    case 'cancel':
      return apiClient.PATCH('/v1/orders/{id}/cancel', {
        params: pathParams,
      });
  }
}

export async function transitionOrderRequest(
  orderId: number,
  action: OrderStatusAction,
): Promise<OrderMutationResponseDto> {
  const { data, error, response } = await patchOrderTransition(orderId, action);

  if (error || !response.ok || !data) {
    const parsed = response ? await readApiErrorFromResponse(response) : null;
    throw toApiRequestError(
      response ?? new Response(null, { status: 500 }),
      parsed,
      `Failed to ${action} order`,
    );
  }

  return data as OrderMutationResponseDto;
}
