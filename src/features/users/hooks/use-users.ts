import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  activateUserRequest,
  addUserAddressRequest,
  assignUserRoleRequest,
  deactivateUserRequest,
  deleteUserAddressRequest,
  getUserRequest,
  listUsersRequest,
  setDefaultUserAddressRequest,
  updateUserAddressRequest,
  updateUserRequest,
} from '@/features/users/api/users-api';
import { userKeys } from '@/features/users/hooks/user-keys';
import { normalizeUserListFilters } from '@/features/users/lib/user-list-filters';
import type {
  AddAddressDto,
  AssignRoleDto,
  UpdateAddressDto,
  UpdateUserDto,
  UserListFilters,
} from '@/features/users/types';
import {
  isOptimisticLockConflict,
  type ApiRequestError,
} from '@/lib/api/parse-api-error';

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

async function invalidateUserQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  userId: number,
) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: userKeys.detail(userId) }),
    queryClient.invalidateQueries({ queryKey: userKeys.lists() }),
  ]);
}

function useUserAddressMutation<TVariables>(
  userId: number,
  mutationFn: (variables: TVariables) => Promise<void>,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: async () => {
      await invalidateUserQueries(queryClient, userId);
    },
    onError: async (error: Error) => {
      if (isOptimisticLockConflict(error as ApiRequestError)) {
        await queryClient.invalidateQueries({
          queryKey: userKeys.detail(userId),
        });
      }
    },
  });
}

export function useAddUserAddress(userId: number) {
  return useUserAddressMutation(userId, (body: AddAddressDto) =>
    addUserAddressRequest(userId, body),
  );
}

export function useUpdateUserAddress(userId: number) {
  return useUserAddressMutation(
    userId,
    ({ addressId, body }: { addressId: number; body: UpdateAddressDto }) =>
      updateUserAddressRequest(userId, addressId, body),
  );
}

export function useDeleteUserAddress(userId: number) {
  return useUserAddressMutation(userId, (addressId: number) =>
    deleteUserAddressRequest(userId, addressId),
  );
}

export function useSetDefaultUserAddress(userId: number) {
  return useUserAddressMutation(userId, (addressId: number) =>
    setDefaultUserAddressRequest(userId, addressId),
  );
}
