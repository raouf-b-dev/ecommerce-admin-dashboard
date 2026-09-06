import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  loginRequest,
  NotOperatorError,
  refreshSessionRequest,
} from '@/features/auth/api/auth-api';

vi.mock('@/features/auth/lib/jwt-decode', () => ({
  decodeAccessTokenClaims: vi.fn(),
}));

vi.mock('@/lib/auth/auth-session', () => ({
  setAccessToken: vi.fn(),
  clearAccessToken: vi.fn(),
}));

vi.mock('@/lib/api/client', () => ({
  apiClient: {
    POST: vi.fn(),
  },
}));

import { decodeAccessTokenClaims } from '@/features/auth/lib/jwt-decode';
import { clearAccessToken, setAccessToken } from '@/lib/auth/auth-session';
import { apiClient } from '@/lib/api/client';

describe('admin access gate in auth-api', () => {
  beforeEach(() => {
    vi.mocked(apiClient.POST).mockReset();
    vi.mocked(decodeAccessTokenClaims).mockReset();
    vi.mocked(setAccessToken).mockReset();
    vi.mocked(clearAccessToken).mockReset();
  });

  it('loginRequest rejects sessions without access_admin and clears session', async () => {
    vi.mocked(apiClient.POST).mockImplementation(async (path) => {
      if (path === '/v1/authentication/login') {
        return {
          data: {
            accessToken: 'customer-token',
            permissions: ['view_own_orders'],
          },
          error: undefined,
          response: new Response(null, { status: 200 }),
        };
      }

      return {
        data: {},
        error: undefined,
        response: new Response(null, { status: 200 }),
      };
    });

    vi.mocked(decodeAccessTokenClaims).mockReturnValue({
      sub: '9',
      email: 'customer@store.local',
      role: 'CUSTOMER',
    });

    await expect(
      loginRequest({ email: 'customer@store.local', password: 'x' }),
    ).rejects.toBeInstanceOf(NotOperatorError);

    expect(apiClient.POST).toHaveBeenCalledWith(
      '/v1/authentication/logout',
      expect.anything(),
    );
    expect(clearAccessToken).toHaveBeenCalled();
  });

  it('refreshSessionRequest returns null when access_admin is missing', async () => {
    vi.mocked(apiClient.POST).mockImplementation(async (path) => {
      if (path === '/v1/authentication/refresh') {
        return {
          data: {
            accessToken: 'customer-token',
            permissions: ['view_own_orders'],
          },
          error: undefined,
          response: new Response(null, { status: 200 }),
        };
      }

      return {
        data: {},
        error: undefined,
        response: new Response(null, { status: 200 }),
      };
    });

    vi.mocked(decodeAccessTokenClaims).mockReturnValue({
      sub: '9',
      email: 'customer@store.local',
      role: 'CUSTOMER',
    });

    await expect(refreshSessionRequest()).resolves.toBeNull();
    expect(clearAccessToken).toHaveBeenCalled();
  });

  it('loginRequest accepts sessions with access_admin from the auth response', async () => {
    vi.mocked(apiClient.POST).mockResolvedValue({
      data: {
        accessToken: 'admin-token',
        mustChangePassword: false,
        permissions: ['access_admin', 'view_all_users'],
      },
      error: undefined,
      response: new Response(null, { status: 200 }),
    });

    vi.mocked(decodeAccessTokenClaims).mockReturnValue({
      sub: '1',
      email: 'admin@store.local',
      role: 'ADMIN',
    });

    const session = await loginRequest({
      email: 'admin@store.local',
      password: 'x',
    });

    expect(session.role).toBe('ADMIN');
    expect(session.permissions).toEqual([
      'access_admin',
      'view_all_users',
    ]);
    expect(setAccessToken).toHaveBeenCalledWith('admin-token');
  });
});
