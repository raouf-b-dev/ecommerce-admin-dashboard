import { describe, expect, it } from 'vitest';
import {
  getSessionRefetchInterval,
  getSessionRefetchOnFocusOrReconnect,
  SESSION_REFRESH_ERROR_BACKOFF_MS,
} from '@/lib/auth/session-query-policy';
import { createAdminAccessToken } from '@/test/create-test-jwt';

describe('getSessionRefetchInterval', () => {
  it('does not poll when there is no session', () => {
    expect(
      getSessionRefetchInterval({
        hasSession: false,
        hasError: false,
        accessToken: null,
      }),
    ).toBe(false);
  });

  it('backs off after a transient refresh error while the session is kept', () => {
    expect(
      getSessionRefetchInterval({
        hasSession: true,
        hasError: true,
        accessToken: createAdminAccessToken({
          exp: Math.floor(Date.now() / 1000) + 120,
        }),
      }),
    ).toBe(SESSION_REFRESH_ERROR_BACKOFF_MS);
  });

  it('schedules a refresh before JWT exp', () => {
    const token = createAdminAccessToken({
      exp: Math.floor(Date.now() / 1000) + 120,
    });

    expect(
      getSessionRefetchInterval({
        hasSession: true,
        hasError: false,
        accessToken: token,
      }),
    ).toBeGreaterThanOrEqual(1_000);
  });

  it('does not timer-refresh mock tokens that omit exp', () => {
    expect(
      getSessionRefetchInterval({
        hasSession: true,
        hasError: false,
        accessToken: createAdminAccessToken(),
      }),
    ).toBe(false);
  });
});

describe('getSessionRefetchOnFocusOrReconnect', () => {
  it('does not refetch when there is no session', () => {
    expect(
      getSessionRefetchOnFocusOrReconnect({
        hasSession: false,
        accessToken: null,
      }),
    ).toBe(false);
  });

  it('refetches when the access token is missing or expired', () => {
    expect(
      getSessionRefetchOnFocusOrReconnect({
        hasSession: true,
        accessToken: null,
      }),
    ).toBe('always');

    const expired = createAdminAccessToken({
      exp: Math.floor(Date.now() / 1000) - 5,
    });
    expect(
      getSessionRefetchOnFocusOrReconnect({
        hasSession: true,
        accessToken: expired,
      }),
    ).toBe('always');
  });

  it('skips focus refetch while the access token is still usable', () => {
    const fresh = createAdminAccessToken({
      exp: Math.floor(Date.now() / 1000) + 120,
    });
    expect(
      getSessionRefetchOnFocusOrReconnect({
        hasSession: true,
        accessToken: fresh,
      }),
    ).toBe(false);
  });
});
