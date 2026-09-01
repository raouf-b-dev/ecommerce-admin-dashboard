import type { components, operations } from '@/lib/api/generated/schema';

export type CreateProductDto = components['schemas']['CreateProductDto'];
export type UpdateProductDto = components['schemas']['UpdateProductDto'];
export type ProductResponseDto = components['schemas']['ProductResponseDto'];
export type ProductListItemResponseDto =
  components['schemas']['ProductListItemResponseDto'];
export type ProductDetailResponseDto =
  components['schemas']['ProductDetailResponseDto'];
export type PaginatedProductsResponseDto =
  components['schemas']['PaginatedProductsResponseDto'];

export type ListProductsQuery = NonNullable<
  operations['ProductsController_findAll_v1']['parameters']['query']
>;

export type ProductListFilters = {
  page: number;
  limit: number;
  sortBy: NonNullable<ListProductsQuery['sortBy']>;
  sortOrder: NonNullable<ListProductsQuery['sortOrder']>;
  search?: string;
  isActive?: boolean;
  minPrice?: number;
  maxPrice?: number;
  categoryId?: number;
};
