import { createTestJwt } from '@/test/create-test-jwt';
import {
  isAccessTokenUsable,
  msUntilAccessTokenRefresh,
} from '@/lib/auth/access-token';

describe('isAccessTokenUsable', () => {
  it('rejects missing tokens', () => {
    expect(isAccessTokenUsable(null)).toBe(false);
    expect(isAccessTokenUsable('')).toBe(false);
  });

  it('rejects malformed tokens', () => {
    expect(isAccessTokenUsable('not-a-jwt')).toBe(false);
  });

  it('accepts decodeable JWTs without exp (mock tokens)', () => {
    expect(
      isAccessTokenUsable(
        createTestJwt({ sub: '1', email: 'admin@store.local', role: 'ADMIN' }),
      ),
    ).toBe(true);
  });

  it('rejects tokens at or past the refresh skew window', () => {
    const nowMs = 1_700_000_000_000;
    const token = createTestJwt({ exp: Math.floor(nowMs / 1000) + 10 });

    expect(isAccessTokenUsable(token, nowMs)).toBe(false);
  });

  it('accepts tokens with exp well beyond the skew window', () => {
    const nowMs = 1_700_000_000_000;
    const token = createTestJwt({ exp: Math.floor(nowMs / 1000) + 120 });

    expect(isAccessTokenUsable(token, nowMs)).toBe(true);
  });
});

describe('msUntilAccessTokenRefresh', () => {
  it('schedules a short delay when the token is missing', () => {
    expect(msUntilAccessTokenRefresh(null)).toBe(1_000);
  });

  it('returns null when the JWT has no exp', () => {
    expect(
      msUntilAccessTokenRefresh(
        createTestJwt({ sub: '1', email: 'admin@store.local', role: 'ADMIN' }),
      ),
    ).toBeNull();
  });

  it('refreshes before exp using a bounded skew', () => {
    const nowMs = 1_700_000_000_000;
    const token = createTestJwt({ exp: Math.floor(nowMs / 1000) + 120 });

    expect(msUntilAccessTokenRefresh(token, nowMs)).toBe(105_000);
  });

  it('uses a short delay when the token is already expired', () => {
    const nowMs = 1_700_000_000_000;
    const token = createTestJwt({ exp: Math.floor(nowMs / 1000) - 5 });

    expect(msUntilAccessTokenRefresh(token, nowMs)).toBe(1_000);
  });
});
