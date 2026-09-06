import { apiClient } from '@/lib/api/client';
import { throwApiErrorFromResponse } from '@/lib/api/throw-api-error';
import type {
  CreateRoleDto,
  PermissionResponseDto,
  RoleResponseDto,
  UpdateRoleDto,
} from '@/features/roles/types';

export async function listRolesRequest(): Promise<RoleResponseDto[]> {
  const { data, error, response } = await apiClient.GET('/v1/roles');

  if (error || !response.ok || !data) {
    return await throwApiErrorFromResponse(response, 'Failed to load roles');
  }

  return data;
}

export async function getRoleRequest(id: number): Promise<RoleResponseDto> {
  const { data, error, response } = await apiClient.GET('/v1/roles/{id}', {
    params: { path: { id } },
  });

  if (error || !response.ok || !data) {
    return await throwApiErrorFromResponse(response, 'Failed to load role');
  }

  return data;
}

export async function createRoleRequest(
  body: CreateRoleDto,
): Promise<RoleResponseDto> {
  const { data, error, response } = await apiClient.POST('/v1/roles', {
    body,
  });

  if (error || !response.ok || !data) {
    return await throwApiErrorFromResponse(response, 'Failed to create role');
  }

  return data;
}

export async function updateRoleRequest(
  id: number,
  body: UpdateRoleDto,
): Promise<void> {
  const { error, response } = await apiClient.PATCH('/v1/roles/{id}', {
    params: { path: { id } },
    body,
  });

  if (error || !response.ok) {
    return await throwApiErrorFromResponse(response, 'Failed to update role');
  }
}

export async function deleteRoleRequest(id: number): Promise<void> {
  const { error, response } = await apiClient.DELETE('/v1/roles/{id}', {
    params: { path: { id } },
  });

  if (error || !response.ok) {
    return await throwApiErrorFromResponse(response, 'Failed to delete role');
  }
}

export async function listPermissionsRequest(): Promise<
  PermissionResponseDto[]
> {
  const { data, error, response } = await apiClient.GET('/v1/permissions');

  if (error || !response.ok || !data) {
    return await throwApiErrorFromResponse(
      response,
      'Failed to load permissions',
    );
  }

  return data;
}
