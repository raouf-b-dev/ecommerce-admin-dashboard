import { describe, expect, it } from 'vitest';
import {
  normalizeUserListFilters,
  userListFiltersFromSearchParams,
  userListFiltersToSearchParams,
} from '@/features/users/lib/user-list-filters';

describe('userListFilters', () => {
  it('normalizes defaults and trims search', () => {
    expect(normalizeUserListFilters({})).toEqual({
      page: 1,
      limit: 20,
      search: undefined,
      isActive: undefined,
      roleCode: undefined,
    });
    expect(
      normalizeUserListFilters({
        page: 2,
        limit: 10,
        search: '  jane  ',
        isActive: true,
        roleCode: 'CUSTOMER',
      }),
    ).toEqual({
      page: 2,
      limit: 10,
      search: 'jane',
      isActive: true,
      roleCode: 'CUSTOMER',
    });
  });

  it('round-trips search, isActive, and roleCode through URL params', () => {
    const filters = normalizeUserListFilters({
      page: 3,
      limit: 10,
      search: 'store',
      isActive: false,
      roleCode: 'ADMIN',
    });
    const params = userListFiltersToSearchParams(filters);
    expect(params.get('page')).toBe('3');
    expect(params.get('limit')).toBe('10');
    expect(params.get('search')).toBe('store');
    expect(params.get('isActive')).toBe('false');
    expect(params.get('roleCode')).toBe('ADMIN');

    expect(userListFiltersFromSearchParams(params)).toEqual(filters);
  });

  it('ignores invalid roleCode values', () => {
    expect(
      userListFiltersFromSearchParams(
        new URLSearchParams('roleCode=NOT_A_ROLE'),
      ).roleCode,
    ).toBeUndefined();
  });
});
