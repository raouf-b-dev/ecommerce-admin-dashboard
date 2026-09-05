import type { ProductListFilters } from '@/features/products/types';

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ProductListFilters) =>
    [...productKeys.lists(), filters] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number | undefined) => [...productKeys.details(), id] as const,
  categories: () => [...productKeys.all, 'categories'] as const,
};
