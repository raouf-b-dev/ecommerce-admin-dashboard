import { describe, expect, it } from 'vitest';
import {
  DEFAULT_INVENTORY_LIST_FILTERS,
  inventoryListFiltersFromSearchParams,
  inventoryListFiltersToSearchParams,
  normalizeInventoryListFilters,
} from '@/features/inventory/lib/inventory-list-filters';

describe('normalizeInventoryListFilters', () => {
  it('fills backend defaults when empty', () => {
    expect(normalizeInventoryListFilters({})).toEqual(
      DEFAULT_INVENTORY_LIST_FILTERS,
    );
  });

  it('keeps explicit page, limit, and lowStockOnly', () => {
    expect(
      normalizeInventoryListFilters({
        page: 2,
        limit: 20,
        lowStockOnly: true,
      }),
    ).toMatchObject({
      page: 2,
      limit: 20,
      lowStockOnly: true,
    });
  });
});

describe('inventoryListFiltersFromSearchParams', () => {
  it('parses URL params and defaults omitted values', () => {
    expect(
      inventoryListFiltersFromSearchParams(new URLSearchParams()),
    ).toEqual(DEFAULT_INVENTORY_LIST_FILTERS);

    expect(
      inventoryListFiltersFromSearchParams(
        new URLSearchParams(
          'page=3&sku=ABC&lowStockOnly=true&sortBy=availableQuantity&sortOrder=asc',
        ),
      ),
    ).toMatchObject({
      page: 3,
      limit: 10,
      sku: 'ABC',
      lowStockOnly: true,
      sortBy: 'availableQuantity',
      sortOrder: 'asc',
    });
  });
});

describe('inventoryListFiltersToSearchParams', () => {
  it('omits default values from the URL', () => {
    expect(
      inventoryListFiltersToSearchParams(
        DEFAULT_INVENTORY_LIST_FILTERS,
      ).toString(),
    ).toBe('');

    expect(
      inventoryListFiltersToSearchParams({
        ...DEFAULT_INVENTORY_LIST_FILTERS,
        page: 2,
        lowStockOnly: true,
      }).toString(),
    ).toBe('page=2&lowStockOnly=true');
  });
});
