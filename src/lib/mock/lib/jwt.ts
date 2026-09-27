function toBase64Url(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

export type MockJwtClaims = {
  sub: string;
  email: string;
  role: string;
  mustChangePassword?: boolean;
};

/** Unsigned but decodeable JWT for client-side claim parsing. */
export function createMockJwt(claims: MockJwtClaims): string {
  const header = toBase64Url(JSON.stringify({ alg: 'none', typ: 'JWT' }));
  const payload = toBase64Url(JSON.stringify(claims));
  return `${header}.${payload}.mock-signature`;
}
