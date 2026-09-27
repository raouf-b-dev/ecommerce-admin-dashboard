import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createRoleRequest,
  deleteRoleRequest,
  getRoleRequest,
  listPermissionsRequest,
  listRolesRequest,
  updateRoleRequest,
} from '@/features/roles/api/roles-api';
import {
  permissionKeys,
  roleKeys,
} from '@/features/roles/hooks/role-keys';
import type { CreateRoleDto, UpdateRoleDto } from '@/features/roles/types';

export function useRolesListQuery(enabled = true) {
  return useQuery({
    queryKey: roleKeys.lists(),
    queryFn: () => listRolesRequest(),
    enabled,
    staleTime: 60_000,
  });
}

export function useRoleDetailQuery(roleId: number | undefined) {
  return useQuery({
    queryKey: roleKeys.detail(roleId),
    queryFn: () => getRoleRequest(roleId!),
    enabled: typeof roleId === 'number' && roleId > 0,
  });
}

export function usePermissionsListQuery(enabled = true) {
  return useQuery({
    queryKey: permissionKeys.list(),
    queryFn: () => listPermissionsRequest(),
    enabled,
    staleTime: 300_000,
  });
}

export function useCreateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateRoleDto) => createRoleRequest(body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
}

export function useUpdateRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: UpdateRoleDto }) =>
      updateRoleRequest(id, body),
    onSuccess: async (_data, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: roleKeys.lists() }),
        queryClient.invalidateQueries({
          queryKey: roleKeys.detail(variables.id),
        }),
      ]);
    },
  });
}

export function useDeleteRole() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (roleId: number) => deleteRoleRequest(roleId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: roleKeys.lists() });
    },
  });
}
