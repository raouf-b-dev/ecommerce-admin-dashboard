import { apiClient } from '@/lib/api/client';
import { throwApiErrorFromResponse } from '@/lib/api/throw-api-error';
import { toProductsListQuery } from '@/features/products/lib/product-list-filters';
import type {
  CreateProductDto,
  PaginatedProductsResponseDto,
  ProductDetailResponseDto,
  ProductListFilters,
  ProductResponseDto,
  UpdateProductDto,
} from '@/features/products/types';

export async function listProductsRequest(
  filters: ProductListFilters,
): Promise<PaginatedProductsResponseDto> {
  const query = toProductsListQuery(filters);
  const { data, error, response } = await apiClient.GET('/v1/products', {
    params: { query },
  });

  if (error || !response.ok || !data) {
    return await throwApiErrorFromResponse(response, 'Failed to load products');
  }

  return data;
}

export async function getProductRequest(
  id: number,
): Promise<ProductDetailResponseDto> {
  const { data, error, response } = await apiClient.GET('/v1/products/{id}', {
    params: { path: { id } },
  });

  if (error || !response.ok || !data) {
    return await throwApiErrorFromResponse(response, 'Failed to load product');
  }

  return data;
}

export async function createProductRequest(
  body: CreateProductDto,
): Promise<ProductResponseDto> {
  const { data, error, response } = await apiClient.POST('/v1/products', {
    body,
  });

  if (error || !response.ok || !data) {
    return await throwApiErrorFromResponse(
      response,
      'Failed to create product',
    );
  }

  return data;
}

export async function updateProductRequest(
  id: number,
  body: UpdateProductDto,
): Promise<ProductResponseDto> {
  const { data, error, response } = await apiClient.PATCH('/v1/products/{id}', {
    params: { path: { id } },
    body,
  });

  if (error || !response.ok || !data) {
    return await throwApiErrorFromResponse(response, 'Failed to update product');
  }

  return data;
}

export async function deleteProductRequest(id: number): Promise<void> {
  const { error, response } = await apiClient.DELETE('/v1/products/{id}', {
    params: { path: { id } },
  });

  if (error || !response.ok) {
    return await throwApiErrorFromResponse(response, 'Failed to delete product');
  }
}

export async function activateProductRequest(id: number): Promise<void> {
  const { error, response } = await apiClient.POST(
    '/v1/products/{id}/activate',
    {
      params: { path: { id } },
    },
  );

  if (error || !response.ok) {
    return await throwApiErrorFromResponse(
      response,
      'Failed to activate product',
    );
  }
}

export async function deactivateProductRequest(id: number): Promise<void> {
  const { error, response } = await apiClient.POST(
    '/v1/products/{id}/deactivate',
    {
      params: { path: { id } },
    },
  );

  if (error || !response.ok) {
    return await throwApiErrorFromResponse(
      response,
      'Failed to deactivate product',
    );
  }
}
