import { describe, expect, it } from 'vitest';
import {
  DEFAULT_PRODUCT_LIST_FILTERS,
  normalizeProductListFilters,
  productListFiltersFromSearchParams,
  productListFiltersToSearchParams,
} from '@/features/products/lib/product-list-filters';

describe('normalizeProductListFilters', () => {
  it('fills backend defaults when empty', () => {
    expect(normalizeProductListFilters({})).toEqual(DEFAULT_PRODUCT_LIST_FILTERS);
  });

  it('keeps explicit page and limit', () => {
    expect(normalizeProductListFilters({ page: 2, limit: 20 })).toMatchObject({
      page: 2,
      limit: 20,
    });
  });
});

describe('productListFiltersFromSearchParams', () => {
  it('parses URL params and defaults omitted values', () => {
    expect(productListFiltersFromSearchParams(new URLSearchParams())).toEqual(
      DEFAULT_PRODUCT_LIST_FILTERS,
    );

    expect(
      productListFiltersFromSearchParams(
        new URLSearchParams('page=3&sortBy=name&sortOrder=asc'),
      ),
    ).toMatchObject({
      page: 3,
      limit: 10,
      sortBy: 'name',
      sortOrder: 'asc',
    });
  });
});

describe('productListFiltersToSearchParams', () => {
  it('omits default values from the URL', () => {
    expect(
      productListFiltersToSearchParams(DEFAULT_PRODUCT_LIST_FILTERS).toString(),
    ).toBe('');

    expect(
      productListFiltersToSearchParams({
        ...DEFAULT_PRODUCT_LIST_FILTERS,
        page: 2,
      }).toString(),
    ).toBe('page=2');
  });
});
