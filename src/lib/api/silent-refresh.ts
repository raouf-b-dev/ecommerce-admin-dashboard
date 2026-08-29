import { setAccessToken } from '@/lib/auth/auth-session';

const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

let inFlightRefresh: Promise<string | null> | null = null;

function parseAccessToken(data: unknown): string | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const record = data as Record<string, unknown>;
  if (typeof record.accessToken === 'string') {
    return record.accessToken;
  }

  if (typeof record.access_token === 'string') {
    return record.access_token;
  }

  return null;
}

async function performSilentRefresh(): Promise<string | null> {
  try {
    const response = await fetch(`${baseUrl}/v1/authentication/refresh`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: '{}',
    });

    if (!response.ok) {
      return null;
    }

    const data: unknown = await response.json();
    const accessToken = parseAccessToken(data);
    if (!accessToken) {
      return null;
    }

    setAccessToken(accessToken);
    return accessToken;
  } catch {
    return null;
  }
}

/**
 * Single-flight silent refresh for mid-request 401 recovery.
 * Uses raw fetch so it does not re-enter apiClient middleware.
 */
export function silentRefreshAccessToken(): Promise<string | null> {
  if (!inFlightRefresh) {
    inFlightRefresh = performSilentRefresh().finally(() => {
      inFlightRefresh = null;
    });
  }

  return inFlightRefresh;
}

/** Test helper — resets the in-flight latch. */
export function resetSilentRefreshLatchForTests(): void {
  inFlightRefresh = null;
}
