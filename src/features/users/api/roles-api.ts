import { apiClient } from '@/lib/api/client';
import {
  readApiErrorFromResponse,
  toApiRequestError,
} from '@/lib/api/parse-api-error';
import type { RoleResponseDto } from '@/features/users/types';

export async function listRolesRequest(): Promise<RoleResponseDto[]> {
  const { data, error, response } = await apiClient.GET('/v1/roles');

  if (error || !response.ok || !data) {
    const parsed = response ? await readApiErrorFromResponse(response) : null;
    throw toApiRequestError(
      response ?? new Response(null, { status: 500 }),
      parsed,
      'Failed to load roles',
    );
  }

  return data;
}
