import createClient from 'openapi-fetch';
import type { paths } from '@/lib/api/generated/schema';
import {
  ensureFreshAccessToken,
  silentRefreshAccessToken,
} from '@/lib/api/silent-refresh';
import { clearAccessToken } from '@/lib/auth/auth-session';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export const apiClient = createClient<paths>({
  baseUrl,
  credentials: 'include',
});

function isAuthenticationPath(pathname: string): boolean {
  return pathname.includes('/authentication/');
}

function isSilentRefreshExemptPath(pathname: string): boolean {
  return (
    pathname.includes('/authentication/login') ||
    pathname.includes('/authentication/register') ||
    pathname.includes('/authentication/refresh')
  );
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

export function redirectToLogin(): void {
  clearAccessToken();

  if (typeof window === 'undefined') {
    return;
  }

  const redirectTarget = `${window.location.pathname}${window.location.search}`;
  const loginUrl = `/login?redirect=${encodeURIComponent(redirectTarget)}`;

  if (window.location.pathname !== '/login') {
    window.location.assign(loginUrl);
  }
}

/**
 * Attach a usable Bearer token. Login/register/refresh skip this so boot
 * refresh and credential posts do not recurse.
 */
export async function attachAccessToken(request: Request): Promise<void> {
  const url = new URL(request.url);
  if (isSilentRefreshExemptPath(url.pathname)) {
    return;
  }

  const token = await ensureFreshAccessToken();
  if (token) {
    request.headers.set('Authorization', `Bearer ${token}`);
  }
}

/**
 * One-shot silent refresh + single retry for a domain 401.
 * Returns the retry Response, or null when the session was cleared / redirected.
 * Transient refresh failures throw so the operator is not bounced to login
 * while the refresh cookie may still be valid.
 */
export async function recoverFromDomain401(
  request: Request,
): Promise<Response | null> {
  const accessToken = await silentRefreshAccessToken();
  if (!accessToken) {
    redirectToLogin();
    return null;
  }

  const retryHeaders = new Headers(request.headers);
  retryHeaders.set('Authorization', `Bearer ${accessToken}`);

  const retryResponse = await fetch(
    new Request(request, {
      headers: retryHeaders,
    }),
  );

  if (retryResponse.status === 401) {
    redirectToLogin();
    return null;
  }

  return retryResponse;
}

apiClient.use({
  async onRequest({ request }) {
    await attachAccessToken(request);
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

    const recovered = await recoverFromDomain401(request);
    if (recovered) {
      return recovered;
    }
  },
});
