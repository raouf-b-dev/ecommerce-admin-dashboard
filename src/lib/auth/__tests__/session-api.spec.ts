import { describe, expect, it, vi, beforeEach } from 'vitest';
import { buildSessionFromAccessToken } from '@/lib/auth/session-api';

vi.mock('@/lib/auth/jwt-decode', () => ({
  decodeAccessTokenClaims: vi.fn(),
}));

vi.mock('@/lib/auth/auth-session', () => ({
  setAccessToken: vi.fn(),
  clearAccessToken: vi.fn(),
}));

import { decodeAccessTokenClaims } from '@/lib/auth/jwt-decode';

describe('buildSessionFromAccessToken', () => {
  beforeEach(() => {
    vi.mocked(decodeAccessTokenClaims).mockReturnValue({
      sub: '42',
      email: 'seeded@store.local',
      role: 'ADMIN',
      mustChangePassword: true,
    });
  });

  it('uses JWT claim when response body omits the flag', () => {
    const session = buildSessionFromAccessToken('access-token', false);

    expect(session.mustChangePassword).toBe(true);
  });

  it('prefers response body when it sets the flag', () => {
    vi.mocked(decodeAccessTokenClaims).mockReturnValue({
      sub: '42',
      email: 'seeded@store.local',
      role: 'ADMIN',
    });

    const session = buildSessionFromAccessToken('access-token', true);

    expect(session.mustChangePassword).toBe(true);
  });
});
