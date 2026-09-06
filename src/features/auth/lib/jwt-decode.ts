export type AccessTokenClaims = {
  sub: string;
  email: string;
  role: string;
  mustChangePassword?: boolean;
};

export function decodeAccessTokenClaims(
  token: string,
): AccessTokenClaims | null {
  const parts = token.split('.');
  if (parts.length !== 3) {
    return null;
  }

  const payloadPart = parts[1];
  if (!payloadPart) {
    return null;
  }

  try {
    const payload = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), '=');
    const decoded = JSON.parse(atob(padded)) as Record<string, unknown>;

    if (
      typeof decoded.sub !== 'string' ||
      typeof decoded.email !== 'string' ||
      typeof decoded.role !== 'string'
    ) {
      return null;
    }

    return {
      sub: decoded.sub,
      email: decoded.email,
      role: decoded.role,
      mustChangePassword: decoded.mustChangePassword === true,
    };
  } catch {
    return null;
  }
}
