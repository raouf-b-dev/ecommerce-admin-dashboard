import { getAccessToken, setAccessToken } from '@/lib/auth/auth-session';
import { isAccessTokenUsable } from '@/lib/auth/access-token';
import { throwApiErrorFromResponse } from '@/lib/api/throw-api-error';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

export type SilentRefreshResult = {
  accessToken: string;
  permissions: string[];
  mustChangePassword: boolean;
};

type SessionRefreshListener = (result: SilentRefreshResult) => void;
const listeners = new Set<SessionRefreshListener>();

/**
 * Register a callback invoked whenever a mid-request silent refresh succeeds.
 * Returns an unsubscribe function.
 */
export function onSessionRefreshed(listener: SessionRefreshListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

let inFlightRefresh: Promise<SilentRefreshResult | null> | null = null;

function parseAccessToken(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const record = data as Record<string, unknown>;
  return typeof record.accessToken === 'string' ? record.accessToken : null;
}

function parsePermissions(record: Record<string, unknown>): string[] {
  if (Array.isArray(record.permissions)) {
    return record.permissions.filter((item): item is string => typeof item === 'string');
  }
  return [];
}

function parseMustChangePassword(record: Record<string, unknown>): boolean {
  return record.mustChangePassword === true;
}

function notifySessionRefreshed(result: SilentRefreshResult): void {
  listeners.forEach((listener) => {
    try {
      listener(result);
    } catch {
      // Listener exceptions should not affect token return
    }
  });
}

async function performSilentRefresh(): Promise<SilentRefreshResult | null> {
  const response = await fetch(`${baseUrl}/v1/authentication/refresh`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    body: '{}',
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    await throwApiErrorFromResponse(response, 'Failed to restore session');
  }

  const data: unknown = await response.json();
  const accessToken = parseAccessToken(data);
  if (!accessToken) {
    throw new Error('Authentication response missing access token');
  }

  setAccessToken(accessToken);

  const record =
    data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  const refreshResult: SilentRefreshResult = {
    accessToken,
    permissions: parsePermissions(record),
    mustChangePassword: parseMustChangePassword(record),
  };

  notifySessionRefreshed(refreshResult);
  return refreshResult;
}

/**
 * Single-flight silent refresh for boot and mid-request 401 recovery.
 * Uses raw fetch so it does not re-enter apiClient middleware.
 *
 * `null` means the refresh cookie is gone or invalid (unauthenticated).
 * HTTP 5xx / 429 / network failures throw so callers keep the current session.
 */
export function silentRefreshSession(): Promise<SilentRefreshResult | null> {
  if (!inFlightRefresh) {
    inFlightRefresh = performSilentRefresh().finally(() => {
      inFlightRefresh = null;
    });
  }

  return inFlightRefresh;
}

/**
 * Single-flight silent refresh for mid-request 401 recovery.
 * Uses raw fetch so it does not re-enter apiClient middleware.
 */
export async function silentRefreshAccessToken(): Promise<string | null> {
  const result = await silentRefreshSession();
  return result?.accessToken ?? null;
}

/**
 * Return a usable in-memory access token, refreshing via the HttpOnly cookie
 * when the current token is missing, malformed, or near expiry.
 */
export async function ensureFreshAccessToken(): Promise<string | null> {
  const current = getAccessToken();
  if (isAccessTokenUsable(current)) {
    return current;
  }

  return silentRefreshAccessToken();
}

/** Test helper - resets the in-flight latch and registered listeners. */
export function resetSilentRefreshLatchForTests(): void {
  inFlightRefresh = null;
  listeners.clear();
}
