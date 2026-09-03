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
import { dashboardKeys } from '@/features/dashboard/hooks/dashboard-keys';
import { orderKeys } from '@/features/orders/hooks/order-keys';
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
    queryKey: orderKeys.list(normalized),
    queryFn: () => listOrdersRequest(normalized),
    placeholderData: keepPreviousData,
    staleTime: 45_000,
  });
}

export function useOrderDetailQuery(orderId: number | undefined) {
  return useQuery({
    queryKey: orderKeys.detail(orderId),
    queryFn: () => getOrderRequest(orderId!),
    enabled: typeof orderId === 'number' && Number.isFinite(orderId),
    staleTime: 45_000,
  });
}

export function useOrderPaymentQuery(
  orderId: number | undefined,
  enabled: boolean,
) {
  return useQuery({
    queryKey: orderKeys.payment(orderId),
    queryFn: () => getOrderPaymentRequest(orderId!),
    enabled:
      enabled && typeof orderId === 'number' && Number.isFinite(orderId),
    staleTime: 45_000,
  });
}

export function useOrderTransition(orderId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (action: OrderStatusAction) =>
      transitionOrderRequest(orderId, action),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: orderKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: orderKeys.detail(orderId) }),
        queryClient.invalidateQueries({ queryKey: orderKeys.payment(orderId) }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      ]);
    },
    onError: async (error: Error) => {
      if (isOptimisticLockConflict(error as ApiRequestError)) {
        await Promise.all([
          queryClient.invalidateQueries({
            queryKey: orderKeys.detail(orderId),
          }),
          queryClient.invalidateQueries({
            queryKey: orderKeys.payment(orderId),
          }),
        ]);
      }
    },
  });
}
