import { decodeAccessTokenClaims } from '@/features/auth/lib/jwt-decode';
import { resolvePermissionsForRole } from '@/features/auth/constants/system-role-permissions';
import type { AuthSession, AuthTokensResponse } from '@/features/auth/types';
import { setAccessToken } from '@/lib/auth/auth-session';
import { apiClient } from '@/lib/api/client';

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

  return { accessToken, refreshToken };
}

export function buildSessionFromAccessToken(accessToken: string): AuthSession {
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
  };
}

export async function loginRequest(
  credentials: { email: string; password: string },
): Promise<AuthSession> {
  const { data, error, response } = await apiClient.POST('/v1/authentication/login', {
    body: credentials,
  });

  if (error || !response.ok) {
    throw new Error('Invalid credentials');
  }

  const tokens = parseTokensResponse(data);
  return buildSessionFromAccessToken(tokens.accessToken);
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
  return buildSessionFromAccessToken(tokens.accessToken);
}

export async function logoutRequest(): Promise<void> {
  await apiClient.POST('/v1/authentication/logout', {
    body: {},
  });
}
