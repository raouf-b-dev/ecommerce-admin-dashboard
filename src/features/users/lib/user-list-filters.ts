import type { UserListFilters } from '@/features/users/types';

export const DEFAULT_USER_LIST_FILTERS: UserListFilters = {
  page: 1,
  limit: 20,
};

const ROLE_CODE_PATTERN = /^[A-Z][A-Z0-9_]*$/;

export function isValidRoleCode(value: string | null | undefined): value is string {
  return typeof value === 'string' && ROLE_CODE_PATTERN.test(value);
}

export function normalizeUserListFilters(
  input: Partial<UserListFilters> = {},
): UserListFilters {
  const roleCode = input.roleCode?.trim().toUpperCase();

  return {
    page:
      input.page && input.page > 0 ? input.page : DEFAULT_USER_LIST_FILTERS.page,
    limit:
      input.limit && input.limit > 0
        ? input.limit
        : DEFAULT_USER_LIST_FILTERS.limit,
    search: input.search?.trim() ? input.search.trim() : undefined,
    isActive:
      input.isActive === true
        ? true
        : input.isActive === false
          ? false
          : undefined,
    roleCode: isValidRoleCode(roleCode) ? roleCode : undefined,
  };
}

export function userListFiltersFromSearchParams(
  params: URLSearchParams,
): UserListFilters {
  const page = Number(params.get('page') ?? '');
  const limit = Number(params.get('limit') ?? '');
  const search = params.get('search') ?? undefined;
  const isActiveParam = params.get('isActive');
  const roleCode = params.get('roleCode');

  let isActive: boolean | undefined;
  if (isActiveParam === 'true' || isActiveParam === '1') {
    isActive = true;
  } else if (isActiveParam === 'false' || isActiveParam === '0') {
    isActive = false;
  }

  return normalizeUserListFilters({
    page: Number.isFinite(page) ? page : undefined,
    limit: Number.isFinite(limit) ? limit : undefined,
    search,
    isActive,
    roleCode: roleCode ?? undefined,
  });
}

export function userListFiltersToSearchParams(
  filters: UserListFilters,
): URLSearchParams {
  const normalized = normalizeUserListFilters(filters);
  const params = new URLSearchParams();

  if (normalized.page !== DEFAULT_USER_LIST_FILTERS.page) {
    params.set('page', String(normalized.page));
  }
  if (normalized.limit !== DEFAULT_USER_LIST_FILTERS.limit) {
    params.set('limit', String(normalized.limit));
  }
  if (normalized.search) {
    params.set('search', normalized.search);
  }
  if (normalized.isActive === true) {
    params.set('isActive', 'true');
  } else if (normalized.isActive === false) {
    params.set('isActive', 'false');
  }
  if (normalized.roleCode) {
    params.set('roleCode', normalized.roleCode);
  }

  return params;
}
