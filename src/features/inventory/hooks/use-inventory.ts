import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  adjustStockRequest,
  getInventoryRequest,
  listInventoryRequest,
} from '@/features/inventory/api/inventory-api';
import { dashboardKeys } from '@/features/dashboard/hooks/dashboard-keys';
import { inventoryKeys } from '@/features/inventory/hooks/inventory-keys';
import { normalizeInventoryListFilters } from '@/features/inventory/lib/inventory-list-filters';
import type {
  AdjustStockDto,
  InventoryListFilters,
} from '@/features/inventory/types';
import {
  isOptimisticLockConflict,
  type ApiRequestError,
} from '@/lib/api/parse-api-error';

export function useInventoryListQuery(filters: Partial<InventoryListFilters>) {
  const normalized = normalizeInventoryListFilters(filters);

  return useQuery({
    queryKey: inventoryKeys.list(normalized),
    queryFn: () => listInventoryRequest(normalized),
    placeholderData: keepPreviousData,
    staleTime: 45_000,
  });
}

export function useInventoryDetailQuery(productId: number | undefined) {
  return useQuery({
    queryKey: inventoryKeys.detail(productId),
    queryFn: () => getInventoryRequest(productId!),
    enabled: typeof productId === 'number' && Number.isFinite(productId),
    staleTime: 45_000,
  });
}

export function useAdjustStock(productId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AdjustStockDto) => adjustStockRequest(productId, body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: inventoryKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: inventoryKeys.detail(productId),
        }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      ]);
    },
    onError: async (error: Error) => {
      if (isOptimisticLockConflict(error as ApiRequestError)) {
        await queryClient.invalidateQueries({
          queryKey: inventoryKeys.detail(productId),
        });
      }
    },
  });
}
