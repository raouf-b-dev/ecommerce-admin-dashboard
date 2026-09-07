import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest';
import {
  attachAccessToken,
  recoverFromDomain401,
  shouldRedirectToChangePassword,
} from '@/lib/api/client';

vi.mock('@/lib/api/silent-refresh', () => ({
  silentRefreshAccessToken: vi.fn(),
  ensureFreshAccessToken: vi.fn(),
}));

vi.mock('@/lib/auth/auth-session', () => ({
  clearAccessToken: vi.fn(),
  getAccessToken: vi.fn(),
  setAccessToken: vi.fn(),
}));

import {
  ensureFreshAccessToken,
  silentRefreshAccessToken,
} from '@/lib/api/silent-refresh';
import { clearAccessToken } from '@/lib/auth/auth-session';

describe('shouldRedirectToChangePassword', () => {
  it('redirects when code is MUST_CHANGE_PASSWORD', () => {
    expect(
      shouldRedirectToChangePassword(403, '/v1/products', {
        code: 'MUST_CHANGE_PASSWORD',
        message: 'Password change required before accessing this resource',
      }),
    ).toBe(true);
  });

  it('redirects on message fallback when code is absent (legacy production shape)', () => {
    expect(
      shouldRedirectToChangePassword(403, '/v1/products', {
        message: 'Password change required before accessing this resource',
      }),
    ).toBe(true);
  });

  it('does not redirect for authentication paths', () => {
    expect(
      shouldRedirectToChangePassword(403, '/v1/authentication/login', {
        code: 'MUST_CHANGE_PASSWORD',
      }),
    ).toBe(false);
  });

  it('does not redirect for unrelated 403 responses', () => {
    expect(
      shouldRedirectToChangePassword(403, '/v1/products', {
        code: 'FORBIDDEN',
        message: 'Insufficient permissions',
      }),
    ).toBe(false);
  });

  it('does not redirect for non-403 status', () => {
    expect(
      shouldRedirectToChangePassword(401, '/v1/products', {
        code: 'MUST_CHANGE_PASSWORD',
      }),
    ).toBe(false);
  });
});

describe('recoverFromDomain401', () => {
  beforeEach(() => {
    vi.mocked(silentRefreshAccessToken).mockReset();
    vi.mocked(clearAccessToken).mockReset();
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('retries the original request once after a successful refresh', async () => {
    vi.mocked(silentRefreshAccessToken).mockResolvedValue('fresh-token');
    vi.mocked(fetch).mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    );

    const request = new Request('http://localhost:3000/v1/products', {
      headers: { Authorization: 'Bearer expired' },
    });

    const recovered = await recoverFromDomain401(request);

    expect(recovered?.status).toBe(200);
    expect(fetch).toHaveBeenCalledTimes(1);
    const retried = vi.mocked(fetch).mock.calls[0]?.[0] as Request;
    expect(retried.headers.get('Authorization')).toBe('Bearer fresh-token');
    expect(clearAccessToken).not.toHaveBeenCalled();
  });

  it('clears session when refresh fails', async () => {
    vi.mocked(silentRefreshAccessToken).mockResolvedValue(null);

    const recovered = await recoverFromDomain401(
      new Request('http://localhost:3000/v1/products'),
    );

    expect(recovered).toBeNull();
    expect(fetch).not.toHaveBeenCalled();
    expect(clearAccessToken).toHaveBeenCalled();
  });

  it('clears session when the retry still returns 401', async () => {
    vi.mocked(silentRefreshAccessToken).mockResolvedValue('fresh-token');
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 401 }));

    const recovered = await recoverFromDomain401(
      new Request('http://localhost:3000/v1/products'),
    );

    expect(recovered).toBeNull();
    expect(clearAccessToken).toHaveBeenCalled();
  });

  it('does not redirect to login when refresh throws a transient error', async () => {
    vi.mocked(silentRefreshAccessToken).mockRejectedValue(
      Object.assign(new Error('Failed to restore session'), { statusCode: 500 }),
    );

    await expect(
      recoverFromDomain401(new Request('http://localhost:3000/v1/products')),
    ).rejects.toMatchObject({ statusCode: 500 });
    expect(clearAccessToken).not.toHaveBeenCalled();
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('attachAccessToken', () => {
  beforeEach(() => {
    vi.mocked(ensureFreshAccessToken).mockReset();
  });

  it.each([
    'http://localhost:3000/v1/authentication/login',
    'http://localhost:3000/v1/authentication/register',
    'http://localhost:3000/v1/authentication/refresh',
  ])('skips credential auth path %s', async (url) => {
    const request = new Request(url, { method: 'POST' });

    await attachAccessToken(request);

    expect(ensureFreshAccessToken).not.toHaveBeenCalled();
    expect(request.headers.get('Authorization')).toBeNull();
  });

  it('refreshes and attaches a Bearer token on domain requests', async () => {
    vi.mocked(ensureFreshAccessToken).mockResolvedValue('fresh-token');
    const request = new Request('http://localhost:3000/v1/products');

    await attachAccessToken(request);

    expect(ensureFreshAccessToken).toHaveBeenCalledTimes(1);
    expect(request.headers.get('Authorization')).toBe('Bearer fresh-token');
  });

  it('refreshes before logout and change-password so expired access tokens still work', async () => {
    vi.mocked(ensureFreshAccessToken).mockResolvedValue('fresh-token');
    const request = new Request('http://localhost:3000/v1/authentication/logout', {
      method: 'POST',
    });

    await attachAccessToken(request);

    expect(ensureFreshAccessToken).toHaveBeenCalledTimes(1);
    expect(request.headers.get('Authorization')).toBe('Bearer fresh-token');
  });
});
