import { decodeAccessTokenClaims } from '@/features/auth/lib/jwt-decode';
import { ACCESS_ADMIN_PERMISSION } from '@/features/auth/constants/admin-access';
import type {
  AuthSession,
  AuthTokensResponse,
  ChangePasswordInput,
  LoginCredentials,
} from '@/features/auth/types';
import { clearAccessToken, setAccessToken } from '@/lib/auth/auth-session';
import { apiClient } from '@/lib/api/client';
import {
  readAuthErrorFromResponse,
  toAuthRequestError,
} from '@/features/auth/api/parse-auth-error';
import { hasPermission } from '@/lib/auth/permissions';

export class NotOperatorError extends Error {
  constructor() {
    super('NOT_OPERATOR');
    this.name = 'NotOperatorError';
  }
}

function parsePermissions(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === 'string');
}

function parseTokensResponse(data: unknown): AuthTokensResponse {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid authentication response');
  }

  const record = data as Record<string, unknown>;
  if (typeof record.accessToken !== 'string') {
    throw new Error('Authentication response missing access token');
  }

  return {
    accessToken: record.accessToken,
    refreshToken:
      typeof record.refreshToken === 'string'
        ? record.refreshToken
        : undefined,
    mustChangePassword: record.mustChangePassword === true,
    permissions: parsePermissions(record.permissions),
  };
}

export function buildSessionFromAccessToken(
  accessToken: string,
  mustChangePassword = false,
  permissions: string[] = [],
): AuthSession {
  const claims = decodeAccessTokenClaims(accessToken);
  if (!claims) {
    throw new Error('Invalid access token');
  }

  setAccessToken(accessToken);

  return {
    userId: claims.sub,
    email: claims.email,
    role: claims.role,
    permissions,
    mustChangePassword:
      mustChangePassword || claims.mustChangePassword === true,
  };
}

function hasAdminAccess(permissions: string[]): boolean {
  return hasPermission(permissions, ACCESS_ADMIN_PERMISSION);
}

async function clearNonOperatorSession(): Promise<void> {
  try {
    await logoutRequest();
  } catch {
    // Best-effort cookie clear; always drop in-memory token.
  } finally {
    clearAccessToken();
  }
}

async function ensureAdminAccessSession(
  accessToken: string,
  mustChangePassword: boolean,
  permissions: string[],
): Promise<AuthSession> {
  if (!hasAdminAccess(permissions)) {
    setAccessToken(accessToken);
    await clearNonOperatorSession();
    throw new NotOperatorError();
  }

  return buildSessionFromAccessToken(
    accessToken,
    mustChangePassword,
    permissions,
  );
}

export async function loginRequest(
  credentials: LoginCredentials,
): Promise<AuthSession> {
  const { data, error, response } = await apiClient.POST('/v1/authentication/login', {
    body: credentials,
  });

  if (error || !response.ok) {
    throw new Error('Invalid credentials');
  }

  const tokens = parseTokensResponse(data);
  return ensureAdminAccessSession(
    tokens.accessToken,
    tokens.mustChangePassword,
    tokens.permissions,
  );
}

export async function refreshSessionRequest(): Promise<AuthSession | null> {
  const { data, error, response } = await apiClient.POST('/v1/authentication/refresh', {
    body: {},
  });

  if (error || response.status === 401) {
    return null;
  }

  if (!response.ok) {
    const parsed = response ? await readAuthErrorFromResponse(response) : null;
    throw toAuthRequestError(
      response ?? new Response(null, { status: 500 }),
      parsed,
      'Failed to restore session',
    );
  }

  const tokens = parseTokensResponse(data);
  if (!hasAdminAccess(tokens.permissions)) {
    setAccessToken(tokens.accessToken);
    await clearNonOperatorSession();
    return null;
  }

  return buildSessionFromAccessToken(
    tokens.accessToken,
    tokens.mustChangePassword,
    tokens.permissions,
  );
}

export async function changePasswordRequest(
  input: ChangePasswordInput,
): Promise<AuthSession> {
  const { data, error, response } = await apiClient.POST(
    '/v1/authentication/change-password',
    {
      body: input,
    },
  );

  if (error || !response.ok) {
    const parsed = response ? await readAuthErrorFromResponse(response) : null;
    throw toAuthRequestError(
      response ?? new Response(null, { status: 500 }),
      parsed,
      'Failed to change password',
    );
  }

  const tokens = parseTokensResponse(data);
  return ensureAdminAccessSession(
    tokens.accessToken,
    tokens.mustChangePassword,
    tokens.permissions,
  );
}

export async function logoutRequest(): Promise<void> {
  await apiClient.POST('/v1/authentication/logout', {
    body: {},
  });
}
