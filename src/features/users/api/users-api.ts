import { apiClient } from '@/lib/api/client';
import { throwApiErrorFromResponse } from '@/lib/api/throw-api-error';
import type {
  AddAddressDto,
  AssignRoleDto,
  PaginatedUsersResponseDto,
  UpdateAddressDto,
  UpdateUserDto,
  UserDetailResponseDto,
  UserListFilters,
} from '@/features/users/types';
import { normalizeUserListFilters } from '@/features/users/lib/user-list-filters';

export async function listUsersRequest(
  filters: Partial<UserListFilters>,
): Promise<PaginatedUsersResponseDto> {
  const query = normalizeUserListFilters(filters);
  const { data, error, response } = await apiClient.GET('/v1/users', {
    params: {
      query: {
        page: query.page,
        limit: query.limit,
        ...(query.search ? { search: query.search } : {}),
        ...(query.isActive === true || query.isActive === false
          ? { isActive: query.isActive }
          : {}),
        ...(query.roleCode ? { roleCode: query.roleCode } : {}),
      },
    },
  });

  if (error || !response.ok || !data) {
    return await throwApiErrorFromResponse(response, 'Failed to load users');
  }

  return data;
}

export async function getUserRequest(
  userId: number,
): Promise<UserDetailResponseDto> {
  const { data, error, response } = await apiClient.GET('/v1/users/{id}', {
    params: { path: { id: userId } },
  });

  if (error || !response.ok || !data) {
    return await throwApiErrorFromResponse(response, 'Failed to load user');
  }

  return data;
}

export async function updateUserRequest(
  userId: number,
  body: UpdateUserDto,
): Promise<void> {
  const { error, response } = await apiClient.PATCH('/v1/users/{id}', {
    params: { path: { id: userId } },
    body,
  });

  if (error || !response.ok) {
    return await throwApiErrorFromResponse(response, 'Failed to update user');
  }
}

export async function activateUserRequest(userId: number): Promise<void> {
  const { error, response } = await apiClient.POST('/v1/users/{id}/activate', {
    params: { path: { id: userId } },
  });

  if (error || !response.ok) {
    return await throwApiErrorFromResponse(response, 'Failed to activate user');
  }
}

export async function deactivateUserRequest(userId: number): Promise<void> {
  const { error, response } = await apiClient.POST(
    '/v1/users/{id}/deactivate',
    {
      params: { path: { id: userId } },
    },
  );

  if (error || !response.ok) {
    return await throwApiErrorFromResponse(
      response,
      'Failed to deactivate user',
    );
  }
}

export async function assignUserRoleRequest(
  userId: number,
  body: AssignRoleDto,
): Promise<void> {
  const { error, response } = await apiClient.PUT('/v1/users/{id}/role', {
    params: { path: { id: userId } },
    body,
  });

  if (error || !response.ok) {
    return await throwApiErrorFromResponse(
      response,
      'Failed to assign user role',
    );
  }
}

export async function addUserAddressRequest(
  userId: number,
  body: AddAddressDto,
): Promise<void> {
  const { error, response } = await apiClient.POST('/v1/users/{id}/addresses', {
    params: { path: { id: userId } },
    body,
  });

  if (error || !response.ok) {
    return await throwApiErrorFromResponse(response, 'Failed to add address');
  }
}

export async function updateUserAddressRequest(
  userId: number,
  addressId: number,
  body: UpdateAddressDto,
): Promise<void> {
  const { error, response } = await apiClient.PATCH(
    '/v1/users/{id}/addresses/{addressId}',
    {
      params: { path: { id: userId, addressId } },
      body,
    },
  );

  if (error || !response.ok) {
    return await throwApiErrorFromResponse(
      response,
      'Failed to update address',
    );
  }
}

export async function deleteUserAddressRequest(
  userId: number,
  addressId: number,
): Promise<void> {
  const { error, response } = await apiClient.DELETE(
    '/v1/users/{id}/addresses/{addressId}',
    {
      params: { path: { id: userId, addressId } },
    },
  );

  if (error || !response.ok) {
    return await throwApiErrorFromResponse(
      response,
      'Failed to delete address',
    );
  }
}

export async function setDefaultUserAddressRequest(
  userId: number,
  addressId: number,
): Promise<void> {
  const { error, response } = await apiClient.PATCH(
    '/v1/users/{id}/addresses/{addressId}/set-default',
    {
      params: { path: { id: userId, addressId } },
    },
  );

  if (error || !response.ok) {
    return await throwApiErrorFromResponse(
      response,
      'Failed to set default address',
    );
  }
}
