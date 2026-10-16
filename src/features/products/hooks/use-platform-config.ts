import { useQuery } from '@tanstack/react-query';
import {
  getPlatformConfigRequest,
  type PlatformConfigDto,
} from '@/features/products/api/platform-config-api';

export function usePlatformConfigQuery() {
  return useQuery<PlatformConfigDto>({
    queryKey: ['platform', 'config'],
    queryFn: () => getPlatformConfigRequest(),
    staleTime: 5 * 60_000,
  });
}
