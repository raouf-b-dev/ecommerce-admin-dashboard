import type { OrderListFilters } from '@/features/orders/types';

export const orderKeys = {
  all: ['orders'] as const,
  lists: () => [...orderKeys.all, 'list'] as const,
  list: (filters: OrderListFilters) =>
    [...orderKeys.lists(), filters] as const,
  details: () => [...orderKeys.all, 'detail'] as const,
  detail: (id: number | undefined) => [...orderKeys.details(), id] as const,
  payment: (id: number | undefined) =>
    [...orderKeys.all, 'payment', id] as const,
};
