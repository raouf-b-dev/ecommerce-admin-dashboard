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
    queryKey: ['inventory', 'list', normalized],
    queryFn: () => listInventoryRequest(normalized),
    placeholderData: keepPreviousData,
  });
}

export function useInventoryDetailQuery(productId: number | undefined) {
  return useQuery({
    queryKey: ['inventory', 'detail', productId],
    queryFn: () => getInventoryRequest(productId!),
    enabled: typeof productId === 'number' && Number.isFinite(productId),
  });
}

export function useAdjustStock(productId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AdjustStockDto) => adjustStockRequest(productId, body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['inventory', 'list'] }),
        queryClient.invalidateQueries({
          queryKey: ['inventory', 'detail', productId],
        }),
      ]);
    },
    onError: async (error: Error) => {
      if (isOptimisticLockConflict(error as ApiRequestError)) {
        await queryClient.invalidateQueries({
          queryKey: ['inventory', 'detail', productId],
        });
      }
    },
  });
}
