function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

/** Unsigned JWT for expiry and claim tests. Not a credential. */
export function createTestJwt(payload: Record<string, unknown>): string {
  const header = toBase64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const body = toBase64Url(JSON.stringify(payload));
  return `${header}.${body}.sig`;
}

export function createAdminAccessToken(
  overrides: Record<string, unknown> = {},
): string {
  return createTestJwt({
    sub: '1',
    email: 'admin@store.local',
    role: 'ADMIN',
    ...overrides,
  });
}
