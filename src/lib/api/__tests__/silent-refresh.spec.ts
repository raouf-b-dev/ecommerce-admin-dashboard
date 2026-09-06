import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  onSessionRefreshed,
  resetSilentRefreshLatchForTests,
  silentRefreshAccessToken,
} from '@/lib/api/silent-refresh';

vi.mock('@/lib/auth/auth-session', () => ({
  setAccessToken: vi.fn(),
}));

import { setAccessToken } from '@/lib/auth/auth-session';

describe('silentRefreshAccessToken', () => {
  beforeEach(() => {
    resetSilentRefreshLatchForTests();
    vi.mocked(setAccessToken).mockReset();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            accessToken: 'new-access',
            permissions: ['access_admin', 'view_all_orders'],
            mustChangePassword: true,
          }),
          {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          },
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

  it('returns null when refresh fails', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(
      new Response(null, { status: 401 }),
    );

    await expect(silentRefreshAccessToken()).resolves.toBeNull();
    expect(setAccessToken).not.toHaveBeenCalled();
  });
});
