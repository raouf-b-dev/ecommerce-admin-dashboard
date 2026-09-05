import { setAccessToken } from '@/lib/auth/auth-session';

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

let inFlightRefresh: Promise<string | null> | null = null;

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

    const record =
      data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
    const refreshResult: SilentRefreshResult = {
      accessToken,
      permissions: parsePermissions(record),
      mustChangePassword: parseMustChangePassword(record),
    };

    listeners.forEach((listener) => {
      try {
        listener(refreshResult);
      } catch {
        // Listener exceptions should not affect token return
      }
    });

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

/** Test helper - resets the in-flight latch and registered listeners. */
export function resetSilentRefreshLatchForTests(): void {
  inFlightRefresh = null;
  listeners.clear();
}
