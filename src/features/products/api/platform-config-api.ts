import { apiClient } from '@/lib/api/client';
import { throwApiErrorFromResponse } from '@/lib/api/throw-api-error';

export interface PlatformConfigDto {
  defaultCurrency: string;
  defaultCurrencyExponent: number;
  supportedCurrencies: string[];
}

export async function getPlatformConfigRequest(): Promise<PlatformConfigDto> {
  const { data, error, response } = await apiClient.GET('/v1/platform/config');

  if (error || !response.ok || !data) {
    return await throwApiErrorFromResponse(
      response,
      'Failed to load platform configuration',
    );
  }

  return data;
}
