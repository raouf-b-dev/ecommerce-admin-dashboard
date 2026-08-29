import { apiClient } from '@/lib/api/client';
import {
  readApiErrorFromResponse,
  toApiRequestError,
} from '@/lib/api/parse-api-error';
import type {
  CreateProductDto,
  ListProductsQuery,
  PaginatedProductsResponseDto,
  ProductDetailResponseDto,
  ProductResponseDto,
  UpdateProductDto,
} from '@/features/products/types';

export async function listProductsRequest(
  query: ListProductsQuery,
): Promise<PaginatedProductsResponseDto> {
  const { data, error, response } = await apiClient.GET('/v1/products', {
    params: { query },
  });

  if (error || !response.ok || !data) {
    const parsed = response ? await readApiErrorFromResponse(response) : null;
    throw toApiRequestError(
      response ?? new Response(null, { status: 500 }),
      parsed,
      'Failed to load products',
    );
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
    const parsed = response ? await readApiErrorFromResponse(response) : null;
    throw toApiRequestError(
      response ?? new Response(null, { status: 500 }),
      parsed,
      'Failed to load product',
    );
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
    const parsed = response ? await readApiErrorFromResponse(response) : null;
    throw toApiRequestError(
      response ?? new Response(null, { status: 500 }),
      parsed,
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
    const parsed = response ? await readApiErrorFromResponse(response) : null;
    throw toApiRequestError(
      response ?? new Response(null, { status: 500 }),
      parsed,
      'Failed to update product',
    );
  }

  return data;
}
