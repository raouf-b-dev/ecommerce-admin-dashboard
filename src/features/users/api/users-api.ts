import { apiClient } from '@/lib/api/client';
import {
  readApiErrorFromResponse,
  toApiRequestError,
} from '@/lib/api/parse-api-error';
import type {
  PaginatedUsersResponseDto,
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
    const parsed = response ? await readApiErrorFromResponse(response) : null;
    if (response?.status === 429) {
      throw toApiRequestError(
        response,
        {
          statusCode: 429,
          message: 'Too many requests. Wait a moment and try again.',
          code: parsed?.code,
        },
        'Too many requests. Wait a moment and try again.',
      );
    }
    throw toApiRequestError(
      response ?? new Response(null, { status: 500 }),
      parsed,
      'Failed to load users',
    );
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
    const parsed = response ? await readApiErrorFromResponse(response) : null;
    throw toApiRequestError(
      response ?? new Response(null, { status: 500 }),
      parsed,
      'Failed to load user',
    );
  }

  return data;
}
