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

export function shouldRedirectToChangePassword(
  status: number,
  pathname: string,
  body: { code?: string; message?: string } | null,
): boolean {
  if (status !== 403 || isAuthenticationPath(pathname) || !body) {
    return false;
  }

  if (body.code === 'MUST_CHANGE_PASSWORD') {
    return true;
  }

  return (
    typeof body.message === 'string' &&
    body.message.includes('Password change required')
  );
}

function redirectToChangePassword(): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (window.location.pathname !== '/change-password') {
    window.location.assign('/change-password');
  }
}

apiClient.use({
  onRequest({ request }) {
    const token = getAccessToken();
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`);
    }
  },
  async onResponse({ response, request }) {
    if (response.status === 403) {
      const url = new URL(request.url);
      if (!isAuthenticationPath(url.pathname)) {
        try {
          const clone = response.clone();
          const body = (await clone.json()) as {
            code?: string;
            message?: string;
          };
          if (shouldRedirectToChangePassword(response.status, url.pathname, body)) {
            redirectToChangePassword();
            return;
          }
        } catch {
          // ignore parse errors
        }
      }
    }

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
