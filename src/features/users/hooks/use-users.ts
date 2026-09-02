import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activateUserRequest,
  assignUserRoleRequest,
  deactivateUserRequest,
  getUserRequest,
  listUsersRequest,
  updateUserRequest,
} from '@/features/users/api/users-api';
import { userKeys } from '@/features/users/hooks/user-keys';
import { normalizeUserListFilters } from '@/features/users/lib/user-list-filters';
import type {
  AssignRoleDto,
  UpdateUserDto,
  UserListFilters,
} from '@/features/users/types';

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

export function useUpdateUser(userId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: UpdateUserDto) => updateUserRequest(userId, body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) }),
        queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
      ]);
    },
  });
}

export function useActivateUser(userId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => activateUserRequest(userId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) }),
        queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
      ]);
    },
  });
}

export function useDeactivateUser(userId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deactivateUserRequest(userId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) }),
        queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
      ]);
    },
  });
}

export function useAssignUserRole(userId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: AssignRoleDto) => assignUserRoleRequest(userId, body),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) }),
        queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
      ]);
    },
  });
}
