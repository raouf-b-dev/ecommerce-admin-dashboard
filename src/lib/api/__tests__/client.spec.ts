import { describe, expect, it } from 'vitest';
import { shouldRedirectToChangePassword } from '@/lib/api/client';

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
