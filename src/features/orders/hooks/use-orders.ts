import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  getOrderRequest,
  listOrdersRequest,
  transitionOrderRequest,
} from '@/features/orders/api/orders-api';
import { getOrderPaymentRequest } from '@/features/orders/api/order-payments-api';
import { normalizeOrderListFilters } from '@/features/orders/lib/order-list-filters';
import type {
  OrderListFilters,
  OrderStatusAction,
} from '@/features/orders/types';
import {
  isOptimisticLockConflict,
  type ApiRequestError,
} from '@/lib/api/parse-api-error';

export function useOrdersListQuery(filters: Partial<OrderListFilters>) {
  const normalized = normalizeOrderListFilters(filters);

  return useQuery({
    queryKey: ['orders', 'list', normalized],
    queryFn: () => listOrdersRequest(normalized),
    placeholderData: keepPreviousData,
  });
}

export function useOrderDetailQuery(orderId: number | undefined) {
  return useQuery({
    queryKey: ['orders', 'detail', orderId],
    queryFn: () => getOrderRequest(orderId!),
    enabled: typeof orderId === 'number' && Number.isFinite(orderId),
  });
}

export function useOrderPaymentQuery(
  orderId: number | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: ['orders', 'payment', orderId],
    queryFn: () => getOrderPaymentRequest(orderId!),
    enabled:
      enabled && typeof orderId === 'number' && Number.isFinite(orderId),
  });
}

export function useOrderTransition(orderId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (action: OrderStatusAction) =>
      transitionOrderRequest(orderId, action),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['orders', 'list'] }),
        queryClient.invalidateQueries({
          queryKey: ['orders', 'detail', orderId],
        }),
        queryClient.invalidateQueries({
          queryKey: ['orders', 'payment', orderId],
        }),
      ]);
    },
    onError: async (error: Error) => {
      if (isOptimisticLockConflict(error as ApiRequestError)) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: ['orders', 'detail', orderId],
          }),
          queryClient.invalidateQueries({
            queryKey: ['orders', 'payment', orderId],
          }),
        ]);
      }
    },
  });
}
