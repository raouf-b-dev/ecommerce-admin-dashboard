import { parseHttpUrl } from '@/lib/url';

export function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL?.trim() ?? '';
  if (!raw) {
    if (import.meta.env.PROD) {
      throw new Error(
        'VITE_API_BASE_URL must be configured for production builds.',
      );
    }
    return 'http://localhost:3000';
  }

  const parsed = parseHttpUrl(raw);
  if (parsed === null) {
    throw new Error(
      `VITE_API_BASE_URL must be an absolute http(s) URL: ${raw}`,
    );
  }

  return parsed.replace(/\/+$/, '');
}

export const API_BASE_URL = getApiBaseUrl();
