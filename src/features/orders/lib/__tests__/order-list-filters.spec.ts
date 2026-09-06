import { describe, expect, it } from 'vitest';
import {
  DEFAULT_ORDER_LIST_FILTERS,
  normalizeOrderListFilters,
  orderListFiltersFromSearchParams,
  orderListFiltersToSearchParams,
  toOrdersListQuery,
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
    expect(orderListFiltersFromSearchParams(new URLSearchParams())).toMatchObject(
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

  it('parses and serializes userId', () => {
    expect(
      orderListFiltersFromSearchParams(
        new URLSearchParams('userId=42'),
      ).userId,
    ).toBe(42);

    expect(
      orderListFiltersToSearchParams({
        ...DEFAULT_ORDER_LIST_FILTERS,
        userId: 42,
      }).toString(),
    ).toBe('userId=42');
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

  it('serializes date and amount filters', () => {
    const params = orderListFiltersToSearchParams({
      ...DEFAULT_ORDER_LIST_FILTERS,
      createdAfter: '2026-01-01',
      createdBefore: '2026-01-31',
      minAmount: 50,
      maxAmount: 200,
      firstName: 'Ada',
      lastName: 'Lovelace',
    });

    expect(params.get('createdAfter')).toBe('2026-01-01');
    expect(params.get('createdBefore')).toBe('2026-01-31');
    expect(params.get('minAmount')).toBe('50');
    expect(params.get('maxAmount')).toBe('200');
    expect(params.get('firstName')).toBe('Ada');
    expect(params.get('lastName')).toBe('Lovelace');
  });
});

describe('toOrdersListQuery', () => {
  it('maps createdAfter to API start-of-day ISO', () => {
    expect(
      toOrdersListQuery({
        ...DEFAULT_ORDER_LIST_FILTERS,
        createdAfter: '2026-03-01',
      }).createdAfter,
    ).toBe('2026-03-01T00:00:00.000Z');
  });
});
