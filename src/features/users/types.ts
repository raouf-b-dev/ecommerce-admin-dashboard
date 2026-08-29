import type { components, operations } from '@/lib/api/generated/schema';

export type UserListItemResponseDto =
  components['schemas']['UserListItemResponseDto'];
export type UserDetailResponseDto =
  components['schemas']['UserDetailResponseDto'];
export type PaginatedUsersResponseDto =
  components['schemas']['PaginatedUsersResponseDto'];

export type ListUsersQuery = NonNullable<
  operations['UsersController_listUsers_v1']['parameters']['query']
>;

export type UserRoleCode = NonNullable<ListUsersQuery['roleCode']>;

export type UserListFilters = {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
  roleCode?: UserRoleCode;
};
