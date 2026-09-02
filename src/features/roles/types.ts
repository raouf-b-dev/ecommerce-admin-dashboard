import type { components } from '@/lib/api/generated/schema';

export type RoleResponseDto = components['schemas']['RoleResponseDto'];
export type CreateRoleDto = components['schemas']['CreateRoleDto'];
export type UpdateRoleDto = components['schemas']['UpdateRoleDto'];

/** OpenAPI permissions list response is untyped in generated schema; matches API DTO. */
export type PermissionResponseDto = {
  id: number;
  code: string;
  description: string | null;
};
