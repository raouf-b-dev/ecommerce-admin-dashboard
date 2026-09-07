const ACCESS_TOKEN_REFRESH_SKEW_MS = 15_000;
const MIN_REFRESH_DELAY_MS = 1_000;

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const parts = token.split('.');
  const payloadPart = parts[1];
  if (parts.length !== 3 || !payloadPart) {
    return null;
  }

  try {
    const payload = payloadPart.replace(/-/g, '+').replace(/_/g, '/');
    const padded = payload.padEnd(
      payload.length + ((4 - (payload.length % 4)) % 4),
      '=',
    );
    return JSON.parse(atob(padded)) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * True when the in-memory access token can still be sent as Bearer.
 * Missing, malformed, or near-expiry tokens are not usable.
 * JWTs without `exp` (mock tokens) are treated as usable until a domain 401.
 */
export function isAccessTokenUsable(
  token: string | null,
  nowMs = Date.now(),
): boolean {
  if (!token) {
    return false;
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return false;
  }

  const exp = payload.exp;
  if (typeof exp !== 'number' || !Number.isFinite(exp)) {
    return true;
  }

  return exp * 1000 - ACCESS_TOKEN_REFRESH_SKEW_MS > nowMs;
}

/**
 * Delay until the session query should refresh the access token.
 * `null` means no timer (JWT has no exp). `0` is never returned — callers get
 * at least {@link MIN_REFRESH_DELAY_MS} so a missing/expired token cannot spin.
 */
export function msUntilAccessTokenRefresh(
  token: string | null,
  nowMs = Date.now(),
): number | null {
  if (!token) {
    return MIN_REFRESH_DELAY_MS;
  }

  const payload = decodeJwtPayload(token);
  if (!payload) {
    return MIN_REFRESH_DELAY_MS;
  }

  const exp = payload.exp;
  if (typeof exp !== 'number' || !Number.isFinite(exp)) {
    return null;
  }

  const remaining = exp * 1000 - nowMs;
  if (remaining <= 0) {
    return MIN_REFRESH_DELAY_MS;
  }

  const skew = Math.min(ACCESS_TOKEN_REFRESH_SKEW_MS, remaining / 5);
  return Math.max(MIN_REFRESH_DELAY_MS, remaining - skew);
}
