import { useQuery } from '@tanstack/react-query';
import { listRolesRequest } from '@/features/users/api/roles-api';

export function useRolesListQuery(enabled = true) {
  return useQuery({
    queryKey: ['roles', 'list'],
    queryFn: () => listRolesRequest(),
    enabled,
    staleTime: 60_000,
  });
}
