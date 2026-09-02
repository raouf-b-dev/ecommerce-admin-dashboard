import { apiClient } from '@/lib/api/client';
import { throwApiErrorFromResponse } from '@/lib/api/throw-api-error';
import type {
  PaginatedUsersResponseDto,
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
