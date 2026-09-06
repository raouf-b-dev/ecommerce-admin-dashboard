import type {
  ListProductsQuery,
  ProductListFilters,
} from '@/features/products/types';
import {
  parseIsActiveParam,
  parseNonNegativeNumber,
  parsePositiveInt,
} from '@/lib/list-filters';

export const DEFAULT_PRODUCT_LIST_FILTERS: ProductListFilters = {
  page: 1,
  limit: 10,
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

const PRODUCT_SORT_BY = [
  'createdAt',
  'price',
  'name',
  'id',
] as const satisfies readonly NonNullable<ListProductsQuery['sortBy']>[];

const SORT_ORDERS = [
  'asc',
  'desc',
] as const satisfies readonly NonNullable<ListProductsQuery['sortOrder']>[];

function isProductSortBy(
  value: string | null,
): value is NonNullable<ListProductsQuery['sortBy']> {
  return (
    value !== null && (PRODUCT_SORT_BY as readonly string[]).includes(value)
  );
}

function isSortOrder(
  value: string | null,
): value is NonNullable<ListProductsQuery['sortOrder']> {
  return value !== null && (SORT_ORDERS as readonly string[]).includes(value);
}

export function normalizeProductListFilters(
  input: Partial<ProductListFilters> = {},
): ProductListFilters {
  return {
    page: input.page && input.page > 0 ? input.page : DEFAULT_PRODUCT_LIST_FILTERS.page,
    limit:
      input.limit && input.limit > 0
        ? input.limit
        : DEFAULT_PRODUCT_LIST_FILTERS.limit,
    sortBy: input.sortBy ?? DEFAULT_PRODUCT_LIST_FILTERS.sortBy,
    sortOrder: input.sortOrder ?? DEFAULT_PRODUCT_LIST_FILTERS.sortOrder,
    search: input.search?.trim() ? input.search.trim() : undefined,
    isActive:
      input.isActive === true
        ? true
        : input.isActive === false
          ? false
          : undefined,
    minPrice: parseNonNegativeNumber(input.minPrice),
    maxPrice: parseNonNegativeNumber(input.maxPrice),
    categoryId: parsePositiveInt(input.categoryId),
  };
}

export function productListFiltersFromSearchParams(
  params: URLSearchParams,
): ProductListFilters {
  const page = Number(params.get('page') ?? '');
  const limit = Number(params.get('limit') ?? '');
  const sortBy = params.get('sortBy');
  const sortOrder = params.get('sortOrder');
  const search = params.get('search') ?? undefined;
  const minPriceParam = params.get('minPrice');
  const maxPriceParam = params.get('maxPrice');
  const categoryIdParam = params.get('categoryId');

  return normalizeProductListFilters({
    page: Number.isFinite(page) ? page : undefined,
    limit: Number.isFinite(limit) ? limit : undefined,
    sortBy: isProductSortBy(sortBy) ? sortBy : undefined,
    sortOrder: isSortOrder(sortOrder) ? sortOrder : undefined,
    search,
    isActive: parseIsActiveParam(params.get('isActive')),
    minPrice:
      minPriceParam !== null && minPriceParam !== ''
        ? Number(minPriceParam)
        : undefined,
    maxPrice:
      maxPriceParam !== null && maxPriceParam !== ''
        ? Number(maxPriceParam)
        : undefined,
    categoryId:
      categoryIdParam !== null && categoryIdParam !== ''
        ? Number(categoryIdParam)
        : undefined,
  });
}

export function productListFiltersToSearchParams(
  filters: ProductListFilters,
): URLSearchParams {
  const normalized = normalizeProductListFilters(filters);
  const params = new URLSearchParams();

  if (normalized.page !== DEFAULT_PRODUCT_LIST_FILTERS.page) {
    params.set('page', String(normalized.page));
  }
  if (normalized.limit !== DEFAULT_PRODUCT_LIST_FILTERS.limit) {
    params.set('limit', String(normalized.limit));
  }
  if (normalized.sortBy !== DEFAULT_PRODUCT_LIST_FILTERS.sortBy) {
    params.set('sortBy', normalized.sortBy);
  }
  if (normalized.sortOrder !== DEFAULT_PRODUCT_LIST_FILTERS.sortOrder) {
    params.set('sortOrder', normalized.sortOrder);
  }
  if (normalized.search) {
    params.set('search', normalized.search);
  }
  if (normalized.isActive === true) {
    params.set('isActive', 'true');
  } else if (normalized.isActive === false) {
    params.set('isActive', 'false');
  }
  if (normalized.minPrice !== undefined) {
    params.set('minPrice', String(normalized.minPrice));
  }
  if (normalized.maxPrice !== undefined) {
    params.set('maxPrice', String(normalized.maxPrice));
  }
  if (normalized.categoryId !== undefined) {
    params.set('categoryId', String(normalized.categoryId));
  }

  return params;
}

export function hasActiveProductListFilters(
  filters: ProductListFilters,
): boolean {
  const normalized = normalizeProductListFilters(filters);
  return Boolean(
    normalized.search ||
      normalized.isActive !== undefined ||
      normalized.minPrice !== undefined ||
      normalized.maxPrice !== undefined ||
      normalized.categoryId !== undefined,
  );
}

export function toProductsListQuery(
  filters: ProductListFilters,
): ListProductsQuery {
  const normalized = normalizeProductListFilters(filters);
  return {
    page: normalized.page,
    limit: normalized.limit,
    sortBy: normalized.sortBy,
    sortOrder: normalized.sortOrder,
    ...(normalized.search ? { search: normalized.search } : {}),
    ...(normalized.isActive !== undefined
      ? { isActive: normalized.isActive }
      : {}),
    ...(normalized.minPrice !== undefined
      ? { minPrice: normalized.minPrice }
      : {}),
    ...(normalized.maxPrice !== undefined
      ? { maxPrice: normalized.maxPrice }
      : {}),
    ...(normalized.categoryId !== undefined
      ? { categoryId: normalized.categoryId }
      : {}),
  };
}
