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
    expect(productListFiltersFromSearchParams(new URLSearchParams())).toMatchObject(
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

  it('serializes filter params', () => {
    const params = productListFiltersToSearchParams({
      ...DEFAULT_PRODUCT_LIST_FILTERS,
      search: 'laptop',
      isActive: true,
      minPrice: 10,
      maxPrice: 500,
      categoryId: 3,
    });

    expect(params.get('search')).toBe('laptop');
    expect(params.get('isActive')).toBe('true');
    expect(params.get('minPrice')).toBe('10');
    expect(params.get('maxPrice')).toBe('500');
    expect(params.get('categoryId')).toBe('3');
  });
});

describe('normalizeProductListFilters', () => {
  it('strips invalid numeric filters', () => {
    expect(
      normalizeProductListFilters({
        minPrice: -5,
        maxPrice: Number.NaN,
        categoryId: 0,
      }),
    ).toMatchObject({
      minPrice: undefined,
      maxPrice: undefined,
      categoryId: undefined,
    });
  });
});
