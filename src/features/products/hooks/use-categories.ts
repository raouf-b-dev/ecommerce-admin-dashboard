import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
} from '@tanstack/react-query';
import {
  activateCategoryRequest,
  createCategoryRequest,
  deactivateCategoryRequest,
  deleteCategoryRequest,
  listCategoriesRequest,
  updateCategoryRequest,
} from '@/features/products/api/categories-api';
import { productKeys } from '@/features/products/hooks/product-keys';
import type {
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@/features/products/types';

async function invalidateCategoryQueries(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: productKeys.categories() }),
    queryClient.invalidateQueries({ queryKey: productKeys.lists() }),
  ]);
}

export function useCategoriesListQuery() {
  return useQuery({
    queryKey: productKeys.categories(),
    queryFn: () => listCategoriesRequest(),
    staleTime: 60_000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateCategoryDto) => createCategoryRequest(body),
    onSuccess: async () => {
      await invalidateCategoryQueries(queryClient);
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateCategoryDto }) =>
      updateCategoryRequest(id, body),
    onSuccess: async () => {
      await invalidateCategoryQueries(queryClient);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: number) => deleteCategoryRequest(categoryId),
    onSuccess: async () => {
      await invalidateCategoryQueries(queryClient);
    },
  });
}

export function useActivateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: number) => activateCategoryRequest(categoryId),
    onSuccess: async () => {
      await invalidateCategoryQueries(queryClient);
    },
  });
}

export function useDeactivateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (categoryId: number) => deactivateCategoryRequest(categoryId),
    onSuccess: async () => {
      await invalidateCategoryQueries(queryClient);
    },
  });
}
