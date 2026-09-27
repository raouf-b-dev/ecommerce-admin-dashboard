import { apiClient } from '@/lib/api/client';
import { throwApiErrorFromResponse } from '@/lib/api/throw-api-error';
import {
  normalizeOrderListFilters,
  toOrdersListQuery,
} from '@/features/orders/lib/order-list-filters';
import type {
  OrderDetailResponseDto,
  OrderListFilters,
  OrderMutationResponseDto,
  OrderStatusAction,
  PaginatedOrdersResponseDto,
} from '@/features/orders/types';

export async function listOrdersRequest(
  filters: Partial<OrderListFilters>,
): Promise<PaginatedOrdersResponseDto> {
  const query = toOrdersListQuery(normalizeOrderListFilters(filters));
  const { data, error, response } = await apiClient.GET('/v1/orders', {
    params: { query },
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
    return await throwApiErrorFromResponse(response, 'Failed to load order');
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
    return await throwApiErrorFromResponse(
      response,
      `Failed to ${action} order`,
    );
  }

  return data as OrderMutationResponseDto;
}
