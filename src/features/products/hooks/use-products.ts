import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  createProductRequest,
  getProductRequest,
  listProductsRequest,
  updateProductRequest,
} from '@/features/products/api/products-api';
import { dashboardKeys } from '@/features/dashboard/hooks/dashboard-keys';
import { productKeys } from '@/features/products/hooks/product-keys';
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

export function useProductsListQuery(filters: Partial<ProductListFilters>) {
  const normalized = normalizeProductListFilters(filters);

  return useQuery({
    queryKey: productKeys.list(normalized),
    queryFn: () => listProductsRequest(normalized),
    placeholderData: keepPreviousData,
  });
}

export function useProductQuery(id: number | undefined) {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => getProductRequest(id!),
    enabled: typeof id === 'number' && Number.isFinite(id),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateProductDto) => createProductRequest(body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      ]);
    },
  });
}

export function useUpdateProduct(id: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateProductDto) => updateProductRequest(id, body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
        queryClient.invalidateQueries({ queryKey: productKeys.detail(id) }),
        queryClient.invalidateQueries({ queryKey: dashboardKeys.all }),
      ]);
    },
    onError: async (error: Error) => {
      if (isOptimisticLockConflict(error as ApiRequestError)) {
        await queryClient.invalidateQueries({
          queryKey: productKeys.detail(id),
        });
      }
    },
  });
}
