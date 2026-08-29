import type {
  InventoryListFilters,
  ListInventoryQuery,
} from '@/features/inventory/types';

export const DEFAULT_INVENTORY_LIST_FILTERS: InventoryListFilters = {
  page: 1,
  limit: 10,
  sortBy: 'updatedAt',
  sortOrder: 'desc',
};

const INVENTORY_SORT_BY = [
  'updatedAt',
  'availableQuantity',
  'totalQuantity',
  'productId',
] as const satisfies readonly NonNullable<ListInventoryQuery['sortBy']>[];

const SORT_ORDERS = [
  'asc',
  'desc',
] as const satisfies readonly NonNullable<ListInventoryQuery['sortOrder']>[];

function isInventorySortBy(
  value: string | null,
): value is NonNullable<ListInventoryQuery['sortBy']> {
  return (
    value !== null && (INVENTORY_SORT_BY as readonly string[]).includes(value)
  );
}

function isSortOrder(
  value: string | null,
): value is NonNullable<ListInventoryQuery['sortOrder']> {
  return value !== null && (SORT_ORDERS as readonly string[]).includes(value);
}

export function normalizeInventoryListFilters(
  input: Partial<InventoryListFilters> = {},
): InventoryListFilters {
  return {
    page:
      input.page && input.page > 0
        ? input.page
        : DEFAULT_INVENTORY_LIST_FILTERS.page,
    limit:
      input.limit && input.limit > 0
        ? input.limit
        : DEFAULT_INVENTORY_LIST_FILTERS.limit,
    sortBy: input.sortBy ?? DEFAULT_INVENTORY_LIST_FILTERS.sortBy,
    sortOrder: input.sortOrder ?? DEFAULT_INVENTORY_LIST_FILTERS.sortOrder,
    sku: input.sku?.trim() ? input.sku.trim() : undefined,
    productTitle: input.productTitle?.trim()
      ? input.productTitle.trim()
      : undefined,
    lowStockOnly: input.lowStockOnly === true ? true : undefined,
  };
}

export function inventoryListFiltersFromSearchParams(
  params: URLSearchParams,
): InventoryListFilters {
  const page = Number(params.get('page') ?? '');
  const limit = Number(params.get('limit') ?? '');
  const sortBy = params.get('sortBy');
  const sortOrder = params.get('sortOrder');
  const sku = params.get('sku') ?? undefined;
  const productTitle = params.get('productTitle') ?? undefined;
  const lowStockOnly = params.get('lowStockOnly');

  return normalizeInventoryListFilters({
    page: Number.isFinite(page) ? page : undefined,
    limit: Number.isFinite(limit) ? limit : undefined,
    sortBy: isInventorySortBy(sortBy) ? sortBy : undefined,
    sortOrder: isSortOrder(sortOrder) ? sortOrder : undefined,
    sku,
    productTitle,
    lowStockOnly: lowStockOnly === 'true' || lowStockOnly === '1',
  });
}

export function inventoryListFiltersToSearchParams(
  filters: InventoryListFilters,
): URLSearchParams {
  const normalized = normalizeInventoryListFilters(filters);
  const params = new URLSearchParams();

  if (normalized.page !== DEFAULT_INVENTORY_LIST_FILTERS.page) {
    params.set('page', String(normalized.page));
  }
  if (normalized.limit !== DEFAULT_INVENTORY_LIST_FILTERS.limit) {
    params.set('limit', String(normalized.limit));
  }
  if (normalized.sortBy !== DEFAULT_INVENTORY_LIST_FILTERS.sortBy) {
    params.set('sortBy', normalized.sortBy);
  }
  if (normalized.sortOrder !== DEFAULT_INVENTORY_LIST_FILTERS.sortOrder) {
    params.set('sortOrder', normalized.sortOrder);
  }
  if (normalized.sku) {
    params.set('sku', normalized.sku);
  }
  if (normalized.productTitle) {
    params.set('productTitle', normalized.productTitle);
  }
  if (normalized.lowStockOnly) {
    params.set('lowStockOnly', 'true');
  }

  return params;
}
