// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: AGPL-3.0-only

import type { components, operations } from '@/lib/api/generated/schema';

export type UserListItemResponseDto =
  components['schemas']['UserListItemResponseDto'];
export type UserDetailResponseDto =
  components['schemas']['UserDetailResponseDto'];
export type UpdateUserDto = components['schemas']['UpdateUserDto'];
export type AssignRoleDto = components['schemas']['AssignRoleDto'];
export type AddAddressDto = components['schemas']['AddAddressDto'];
export type UpdateAddressDto = components['schemas']['UpdateAddressDto'];
export type AddressResponseDto = components['schemas']['AddressResponseDto'];
export type PaginatedUsersResponseDto =
  components['schemas']['PaginatedUsersResponseDto'];

export type ListUsersQuery = NonNullable<
  operations['UsersController_listUsers_v1']['parameters']['query']
>;

export type UserListFilters = {
  page: number;
  limit: number;
  search?: string;
  isActive?: boolean;
  roleCode?: string;
};
