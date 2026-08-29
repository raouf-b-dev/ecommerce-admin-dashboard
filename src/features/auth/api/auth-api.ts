import { decodeAccessTokenClaims } from '@/features/auth/lib/jwt-decode';
import { ACCESS_ADMIN_PERMISSION } from '@/features/auth/constants/admin-access';
import { resolvePermissionsForRole } from '@/features/auth/constants/system-role-permissions';
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

function parseTokensResponse(data: unknown): AuthTokensResponse {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid authentication response');
  }

  const record = data as Record<string, unknown>;
  const accessToken =
    typeof record.accessToken === 'string'
      ? record.accessToken
      : typeof record.access_token === 'string'
        ? record.access_token
        : null;

  if (!accessToken) {
    throw new Error('Authentication response missing access token');
  }

  const refreshToken =
    typeof record.refreshToken === 'string'
      ? record.refreshToken
      : typeof record.refresh_token === 'string'
        ? record.refresh_token
        : undefined;

  const mustChangePassword =
    record.mustChangePassword === true || record.must_change_password === true;

  return { accessToken, refreshToken, mustChangePassword };
}

export function buildSessionFromAccessToken(
  accessToken: string,
  mustChangePassword = false,
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
    permissions: resolvePermissionsForRole(claims.role),
    mustChangePassword:
      mustChangePassword || claims.mustChangePassword === true,
  };
}

function roleHasAdminAccess(roleCode: string): boolean {
  return hasPermission(
    resolvePermissionsForRole(roleCode),
    ACCESS_ADMIN_PERMISSION,
  );
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
): Promise<AuthSession> {
  const claims = decodeAccessTokenClaims(accessToken);
  if (!claims || !roleHasAdminAccess(claims.role)) {
    setAccessToken(accessToken);
    await clearNonOperatorSession();
    throw new NotOperatorError();
  }

  return buildSessionFromAccessToken(accessToken, mustChangePassword);
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
  return ensureAdminAccessSession(tokens.accessToken, tokens.mustChangePassword);
}

export async function refreshSessionRequest(): Promise<AuthSession | null> {
  const { data, error, response } = await apiClient.POST('/v1/authentication/refresh', {
    body: {},
  });

  if (error || response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Failed to restore session');
  }

  const tokens = parseTokensResponse(data);
  const claims = decodeAccessTokenClaims(tokens.accessToken);
  if (!claims || !roleHasAdminAccess(claims.role)) {
    setAccessToken(tokens.accessToken);
    await clearNonOperatorSession();
    return null;
  }

  return buildSessionFromAccessToken(
    tokens.accessToken,
    tokens.mustChangePassword,
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
  return ensureAdminAccessSession(tokens.accessToken, tokens.mustChangePassword);
}

export async function logoutRequest(): Promise<void> {
  await apiClient.POST('/v1/authentication/logout', {
    body: {},
  });
}
