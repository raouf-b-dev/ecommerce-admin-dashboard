import { apiClient } from '@/lib/api/client';
import { throwApiErrorFromResponse } from '@/lib/api/throw-api-error';
import type {
  CategoryResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
} from '@/features/products/types';

export async function listCategoriesRequest(): Promise<CategoryResponseDto[]> {
  const { data, error, response } = await apiClient.GET('/v1/categories');

  if (error || !response.ok || !data) {
    return await throwApiErrorFromResponse(
      response,
      'Failed to load categories',
    );
  }

  return data;
}

export async function createCategoryRequest(
  body: CreateCategoryDto,
): Promise<CategoryResponseDto> {
  const { data, error, response } = await apiClient.POST('/v1/categories', {
    body,
  });

  if (error || !response.ok || !data) {
    return await throwApiErrorFromResponse(
      response,
      'Failed to create category',
    );
  }

  return data;
}

export async function updateCategoryRequest(
  id: number,
  body: UpdateCategoryDto,
): Promise<CategoryResponseDto> {
  const { data, error, response } = await apiClient.PATCH(
    '/v1/categories/{id}',
    {
      params: { path: { id } },
      body,
    },
  );

  if (error || !response.ok || !data) {
    return await throwApiErrorFromResponse(
      response,
      'Failed to update category',
    );
  }

  return data;
}

export async function deleteCategoryRequest(id: number): Promise<void> {
  const { error, response } = await apiClient.DELETE('/v1/categories/{id}', {
    params: { path: { id } },
  });

  if (error || !response.ok) {
    return await throwApiErrorFromResponse(
      response,
      'Failed to delete category',
    );
  }
}

export async function activateCategoryRequest(id: number): Promise<void> {
  const { error, response } = await apiClient.POST(
    '/v1/categories/{id}/activate',
    {
      params: { path: { id } },
    },
  );

  if (error || !response.ok) {
    return await throwApiErrorFromResponse(
      response,
      'Failed to activate category',
    );
  }
}

export async function deactivateCategoryRequest(id: number): Promise<void> {
  const { error, response } = await apiClient.POST(
    '/v1/categories/{id}/deactivate',
    {
      params: { path: { id } },
    },
  );

  if (error || !response.ok) {
    return await throwApiErrorFromResponse(
      response,
      'Failed to deactivate category',
    );
  }
}
