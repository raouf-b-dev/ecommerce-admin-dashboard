import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createProductRequest,
  getProductRequest,
  listProductsRequest,
  updateProductRequest,
} from '@/features/products/api/products-api';
import { normalizeProductListFilters } from '@/features/products/lib/product-list-filters';
import type {
  CreateProductDto,
  ProductListFilters,
  UpdateProductDto,
} from '@/features/products/types';
import {
  isOptimisticLockConflict,
  type ApiRequestError,
} from '@/lib/api/parse-api-error';

export function useProductsQuery(filters: Partial<ProductListFilters>) {
  const normalized = normalizeProductListFilters(filters);

  return useQuery({
    queryKey: ['products', 'list', normalized],
    queryFn: () => listProductsRequest(normalized),
  });
}

export function useProductQuery(id: number | undefined) {
  return useQuery({
    queryKey: ['products', 'detail', id],
    queryFn: () => getProductRequest(id!),
    enabled: typeof id === 'number' && Number.isFinite(id),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateProductDto) => createProductRequest(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['products', 'list'] });
    },
  });
}

export function useUpdateProduct(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateProductDto) => updateProductRequest(id, body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['products', 'list'] }),
        queryClient.invalidateQueries({ queryKey: ['products', 'detail', id] }),
      ]);
    },
    onError: async (error: Error) => {
      if (isOptimisticLockConflict(error as ApiRequestError)) {
        await queryClient.invalidateQueries({
          queryKey: ['products', 'detail', id],
        });
      }
    },
  });
}
