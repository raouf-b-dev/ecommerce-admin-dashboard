import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  getUserRequest,
  listUsersRequest,
} from '@/features/users/api/users-api';
import { userKeys } from '@/features/users/hooks/user-keys';
import { normalizeUserListFilters } from '@/features/users/lib/user-list-filters';
import type { UserListFilters } from '@/features/users/types';

export function useUsersListQuery(filters: Partial<UserListFilters>) {
  const normalized = normalizeUserListFilters(filters);

  return useQuery({
    queryKey: userKeys.list(normalized),
    queryFn: () => listUsersRequest(normalized),
    placeholderData: keepPreviousData,
  });
}

export function useUserDetailQuery(userId: number | undefined) {
  return useQuery({
    queryKey: userKeys.detail(userId),
    queryFn: () => getUserRequest(userId!),
    enabled:
      typeof userId === 'number' && Number.isInteger(userId) && userId > 0,
  });
}
