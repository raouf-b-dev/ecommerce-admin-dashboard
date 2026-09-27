import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  ensureFreshAccessToken,
  onSessionRefreshed,
  resetSilentRefreshLatchForTests,
  silentRefreshAccessToken,
} from '@/lib/api/silent-refresh';

vi.mock('@/lib/auth/auth-session', () => ({
  setAccessToken: vi.fn(),
  getAccessToken: vi.fn(),
}));

import { createTestJwt } from '@/test/create-test-jwt';
import { getAccessToken, setAccessToken } from '@/lib/auth/auth-session';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('silentRefreshAccessToken', () => {
  beforeEach(() => {
    resetSilentRefreshLatchForTests();
    vi.mocked(setAccessToken).mockReset();
    vi.mocked(getAccessToken).mockReset();
    vi.mocked(getAccessToken).mockReturnValue(null);
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() =>
        Promise.resolve(
          jsonResponse({
            accessToken: 'new-access',
            permissions: ['access_admin', 'view_all_orders'],
            mustChangePassword: true,
          }),
        ),
      ),
    );
  });

  afterEach(() => {
    resetSilentRefreshLatchForTests();
    vi.unstubAllGlobals();
  });

  it('stores the access token on success', async () => {
    const token = await silentRefreshAccessToken();

    expect(token).toBe('new-access');
    expect(setAccessToken).toHaveBeenCalledWith('new-access');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('notifies registered onSessionRefreshed listeners with full payload', async () => {
    const listener = vi.fn();
    const unsubscribe = onSessionRefreshed(listener);

    await silentRefreshAccessToken();

    expect(listener).toHaveBeenCalledWith({
      accessToken: 'new-access',
      permissions: ['access_admin', 'view_all_orders'],
      mustChangePassword: true,
    });

    unsubscribe();
    resetSilentRefreshLatchForTests();

    await silentRefreshAccessToken();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('single-flights concurrent refresh calls', async () => {
    const first = silentRefreshAccessToken();
    const second = silentRefreshAccessToken();

    const [a, b] = await Promise.all([first, second]);

    expect(a).toBe('new-access');
    expect(b).toBe('new-access');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('returns null when the refresh cookie is invalid', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(new Response(null, { status: 401 }));

    await expect(silentRefreshAccessToken()).resolves.toBeNull();
    expect(setAccessToken).not.toHaveBeenCalled();
  });

  it('throws on transient refresh failures so the session is kept', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ statusCode: 500, message: 'Unavailable' }, 500),
    );

    await expect(silentRefreshAccessToken()).rejects.toMatchObject({
      statusCode: 500,
    });
    expect(setAccessToken).not.toHaveBeenCalled();
  });

  it('throws on refresh rate limits instead of logging the operator out', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      jsonResponse({ statusCode: 429, message: 'Too many requests' }, 429),
    );

    await expect(silentRefreshAccessToken()).rejects.toMatchObject({
      statusCode: 429,
    });
    expect(setAccessToken).not.toHaveBeenCalled();
  });
});

describe('ensureFreshAccessToken', () => {
  beforeEach(() => {
    resetSilentRefreshLatchForTests();
    vi.mocked(setAccessToken).mockReset();
    vi.mocked(getAccessToken).mockReset();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() =>
        Promise.resolve(
          jsonResponse({
            accessToken: 'new-access',
            permissions: ['access_admin'],
            mustChangePassword: false,
          }),
        ),
      ),
    );
  });

  afterEach(() => {
    resetSilentRefreshLatchForTests();
    vi.unstubAllGlobals();
  });

  it('returns the current token when it is still usable', async () => {
    const current = createTestJwt({
      sub: '1',
      email: 'admin@store.local',
      role: 'ADMIN',
      exp: Math.floor(Date.now() / 1000) + 120,
    });
    vi.mocked(getAccessToken).mockReturnValue(current);

    await expect(ensureFreshAccessToken()).resolves.toBe(current);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('refreshes when the access token is missing', async () => {
    vi.mocked(getAccessToken).mockReturnValue(null);

    await expect(ensureFreshAccessToken()).resolves.toBe('new-access');
    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it('refreshes when the access token is expired', async () => {
    const expired = createTestJwt({
      sub: '1',
      email: 'admin@store.local',
      role: 'ADMIN',
      exp: Math.floor(Date.now() / 1000) - 5,
    });
    vi.mocked(getAccessToken).mockReturnValue(expired);

    await expect(ensureFreshAccessToken()).resolves.toBe('new-access');
    expect(fetch).toHaveBeenCalledTimes(1);
  });
});
