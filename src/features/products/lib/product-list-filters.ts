import type { ProductListFilters } from '@/features/products/types';

export const DEFAULT_PRODUCT_LIST_FILTERS: ProductListFilters = {
  page: 1,
  limit: 10,
  // sortBy/sortOrder are URL-ready for the OpenAPI contract; table column-sort UI is deferred.
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

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

  return normalizeProductListFilters({
    page: Number.isFinite(page) ? page : undefined,
    limit: Number.isFinite(limit) ? limit : undefined,
    sortBy:
      sortBy === 'createdAt' ||
      sortBy === 'price' ||
      sortBy === 'name' ||
      sortBy === 'id'
        ? sortBy
        : undefined,
    sortOrder:
      sortOrder === 'asc' || sortOrder === 'desc' ? sortOrder : undefined,
    search,
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

  return params;
}
