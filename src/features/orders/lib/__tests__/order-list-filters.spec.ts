import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ORDER_LIST_FILTERS,
  normalizeOrderListFilters,
  orderListFiltersFromSearchParams,
  orderListFiltersToSearchParams,
} from '@/features/orders/lib/order-list-filters';

describe('normalizeOrderListFilters', () => {
  it('fills backend defaults when empty', () => {
    expect(normalizeOrderListFilters({})).toEqual(DEFAULT_ORDER_LIST_FILTERS);
  });

  it('keeps explicit page, limit, and status', () => {
    expect(
      normalizeOrderListFilters({
        page: 2,
        limit: 20,
        status: 'confirmed',
      }),
    ).toMatchObject({
      page: 2,
      limit: 20,
      status: 'confirmed',
    });
  });
});

describe('orderListFiltersFromSearchParams', () => {
  it('parses URL params and defaults omitted values', () => {
    expect(orderListFiltersFromSearchParams(new URLSearchParams())).toEqual(
      DEFAULT_ORDER_LIST_FILTERS,
    );

    expect(
      orderListFiltersFromSearchParams(
        new URLSearchParams(
          'page=3&status=shipped&userEmail=a@b.com&sortBy=totalPrice&sortOrder=asc',
        ),
      ),
    ).toMatchObject({
      page: 3,
      limit: 10,
      status: 'shipped',
      userEmail: 'a@b.com',
      sortBy: 'totalPrice',
      sortOrder: 'asc',
    });
  });

  it('ignores invalid status values', () => {
    expect(
      orderListFiltersFromSearchParams(
        new URLSearchParams('status=not_a_status'),
      ).status,
    ).toBeUndefined();
  });
});

describe('orderListFiltersToSearchParams', () => {
  it('omits default values from the URL', () => {
    expect(
      orderListFiltersToSearchParams(DEFAULT_ORDER_LIST_FILTERS).toString(),
    ).toBe('');

    expect(
      orderListFiltersToSearchParams({
        ...DEFAULT_ORDER_LIST_FILTERS,
        page: 2,
        status: 'confirmed',
      }).toString(),
    ).toBe('page=2&status=confirmed');
  });
});
