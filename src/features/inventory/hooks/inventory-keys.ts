import type { InventoryListFilters } from '@/features/inventory/types';

export const inventoryKeys = {
  all: ['inventory'] as const,
  lists: () => [...inventoryKeys.all, 'list'] as const,
  list: (filters: InventoryListFilters) =>
    [...inventoryKeys.lists(), filters] as const,
  details: () => [...inventoryKeys.all, 'detail'] as const,
  detail: (id: number | undefined) =>
    [...inventoryKeys.details(), id] as const,
};
