import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { attachAccessToken, recoverFromDomain401 } from '@/lib/api/client';
import { resetSilentRefreshLatchForTests } from '@/lib/api/silent-refresh';
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from '@/lib/auth/auth-session';
import { createAdminAccessToken } from '@/test/create-test-jwt';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function toRequest(input: RequestInfo | URL, init?: RequestInit): Request {
  return input instanceof Request ? input : new Request(String(input), init);
}

function refreshBody(accessToken: string) {
  return {
    accessToken,
    permissions: ['access_admin'],
    mustChangePassword: false,
  };
}

describe('session recovery (real refresh + in-memory token)', () => {
  beforeEach(() => {
    resetSilentRefreshLatchForTests();
    clearAccessToken();
  });

  afterEach(() => {
    resetSilentRefreshLatchForTests();
    clearAccessToken();
    vi.unstubAllGlobals();
  });

  it('refreshes a missing access token before a domain request', async () => {
    const next = createAdminAccessToken({
      exp: Math.floor(Date.now() / 1000) + 120,
    });
    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = toRequest(input, init);
      expect(new URL(request.url).pathname).toContain('/authentication/refresh');
      return jsonResponse(refreshBody(next));
    });
    vi.stubGlobal('fetch', fetchMock);

    const request = new Request('http://localhost:3000/v1/products');
    await attachAccessToken(request);

    expect(request.headers.get('Authorization')).toBe(`Bearer ${next}`);
    expect(getAccessToken()).toBe(next);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('refreshes an expired access token before the domain request', async () => {
    const expired = createAdminAccessToken({
      exp: Math.floor(Date.now() / 1000) - 5,
    });
    const next = createAdminAccessToken({
      email: 'refreshed@store.local',
      exp: Math.floor(Date.now() / 1000) + 120,
    });
    setAccessToken(expired);

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() =>
        Promise.resolve(jsonResponse(refreshBody(next))),
      ),
    );

    const request = new Request('http://localhost:3000/v1/products');
    await attachAccessToken(request);

    expect(request.headers.get('Authorization')).toBe(`Bearer ${next}`);
    expect(request.headers.get('Authorization')).not.toBe(`Bearer ${expired}`);
  });

  it('does not refresh while the current access token is still usable', async () => {
    const current = createAdminAccessToken({
      exp: Math.floor(Date.now() / 1000) + 120,
    });
    setAccessToken(current);
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const request = new Request('http://localhost:3000/v1/products');
    await attachAccessToken(request);

    expect(request.headers.get('Authorization')).toBe(`Bearer ${current}`);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('retries a domain 401 after a successful refresh when exp is absent', async () => {
    const stale = createAdminAccessToken();
    const next = createAdminAccessToken({
      email: 'after-401@store.local',
      exp: Math.floor(Date.now() / 1000) + 120,
    });
    setAccessToken(stale);

    const fetchMock = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const request = toRequest(input, init);
      const url = new URL(request.url);
      if (url.pathname.includes('/authentication/refresh')) {
        return jsonResponse(refreshBody(next));
      }
      expect(request.headers.get('Authorization')).toBe(`Bearer ${next}`);
      return jsonResponse({ ok: true });
    });
    vi.stubGlobal('fetch', fetchMock);

    const original = new Request('http://localhost:3000/v1/products', {
      headers: { Authorization: `Bearer ${stale}` },
    });
    const recovered = await recoverFromDomain401(original);

    expect(recovered?.status).toBe(200);
    expect(getAccessToken()).toBe(next);
  });

  it('does not send the operator to login when refresh returns 5xx after a domain 401', async () => {
    const stale = createAdminAccessToken();
    setAccessToken(stale);

    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() =>
        Promise.resolve(
          jsonResponse({ statusCode: 500, message: 'Unavailable' }, 500),
        ),
      ),
    );

    await expect(
      recoverFromDomain401(new Request('http://localhost:3000/v1/products')),
    ).rejects.toMatchObject({ statusCode: 500 });
    expect(getAccessToken()).toBe(stale);
  });

  it('single-flights refresh when concurrent callers have no access token', async () => {
    const next = createAdminAccessToken({
      exp: Math.floor(Date.now() / 1000) + 120,
    });
    let refreshCalls = 0;
    let releaseRefresh: (() => void) | undefined;
    const refreshGate = new Promise<void>((resolve) => {
      releaseRefresh = resolve;
    });

    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        refreshCalls += 1;
        await refreshGate;
        return jsonResponse(refreshBody(next));
      }),
    );

    const firstRequest = new Request('http://localhost:3000/v1/products');
    const secondRequest = new Request('http://localhost:3000/v1/orders');
    const first = attachAccessToken(firstRequest);
    const second = attachAccessToken(secondRequest);
    await Promise.resolve();
    expect(refreshCalls).toBe(1);
    releaseRefresh?.();
    await Promise.all([first, second]);

    expect(firstRequest.headers.get('Authorization')).toBe(`Bearer ${next}`);
    expect(secondRequest.headers.get('Authorization')).toBe(`Bearer ${next}`);
    expect(refreshCalls).toBe(1);
  });

  it('does not refresh when posting login credentials', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    const request = new Request('http://localhost:3000/v1/authentication/login', {
      method: 'POST',
    });
    await attachAccessToken(request);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(request.headers.get('Authorization')).toBeNull();
  });
});
