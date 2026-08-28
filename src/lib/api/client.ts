import createClient from 'openapi-fetch';
import type { paths } from '@/lib/api/generated/schema';
import { clearAccessToken, getAccessToken } from '@/lib/auth/auth-session';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const apiClient = createClient<paths>({
  baseUrl,
  credentials: 'include',
});

function isAuthenticationPath(pathname: string): boolean {
  return pathname.includes('/authentication/');
}

apiClient.use({
  onRequest({ request }) {
    const token = getAccessToken();
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }
  },
  onResponse({ response, request }) {
    if (response.status !== 401) {
      return;
    }

    const url = new URL(request.url);
    if (isAuthenticationPath(url.pathname)) {
      return;
    }

    clearAccessToken();

    if (typeof window === 'undefined') {
      return;
    }

    const redirectTarget = `${window.location.pathname}${window.location.search}`;
    const loginUrl = `/login?redirect=${encodeURIComponent(redirectTarget)}`;

    if (window.location.pathname !== '/login') {
      window.location.assign(loginUrl);
    }
  },
});
