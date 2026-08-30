import { apiClient } from '@/lib/api/client';
import { throwApiErrorFromResponse } from '@/lib/api/throw-api-error';
import type { RoleResponseDto } from '@/features/users/types';

export async function listRolesRequest(): Promise<RoleResponseDto[]> {
  const { data, error, response } = await apiClient.GET('/v1/roles');

  if (error || !response.ok || !data) {
    return await throwApiErrorFromResponse(response, 'Failed to load roles');
  }

  return data;
}
