import { parseHttpUrl } from '@/lib/url';

declare global {
  interface Window {
    /** Set by /config.js; the Docker image renders it from API_BASE_URL. */
    __APP_CONFIG__?: { apiBaseUrl?: string };
  }
}

export function getApiBaseUrl(): string {
  const runtime = window.__APP_CONFIG__?.apiBaseUrl?.trim() ?? '';
  const source = runtime ? 'API_BASE_URL' : 'VITE_API_BASE_URL';
  const raw = runtime || (import.meta.env.VITE_API_BASE_URL?.trim() ?? '');
  if (!raw) {
    if (import.meta.env.PROD) {
      throw new Error(
        'VITE_API_BASE_URL (or API_BASE_URL in the Docker image) must be configured for production builds.',
      );
    }
    return 'http://localhost:3000';
  }

  const parsed = parseHttpUrl(raw);
  if (parsed === null) {
    throw new Error(`${source} must be an absolute http(s) URL: ${raw}`);
  }

  return parsed.replace(/\/+$/, '');
}

export const API_BASE_URL = getApiBaseUrl();
