import { useQuery } from '@tanstack/react-query';
import { listRolesRequest } from '@/features/users/api/roles-api';
import { roleKeys } from '@/features/users/hooks/user-keys';

export function useRolesListQuery(enabled = true) {
  return useQuery({
    queryKey: roleKeys.lists(),
    queryFn: () => listRolesRequest(),
    enabled,
    staleTime: 60_000,
  });
}
