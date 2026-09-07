# ADR-0008: Keep Session Alive for the Refresh-Token Lifetime

- **Status**: Accepted
- **Date**: 2026-09-07
- **Deciders**: Engineering Core Team
- **Context**: Short-lived access tokens; operators should remain signed in until the HttpOnly refresh cookie expires
- **Does not supersede**: [ADR-0002](ADR-0002-in-memory-access-token-with-httponly-refresh-cookie.md) (in-memory access token, no `localStorage`), [ADR-0005](ADR-0005-silent-one-shot-access-token-refresh.md) (one-shot domain 401 recovery)

---

## 1. Context & Problem Statement

Access tokens are short-lived. ADR-0005 recovers from a domain `401` with one silent refresh, but:

1. The SPA waited for that `401` instead of refreshing when the in-memory access token was already missing or past JWT `exp`.
2. Silent refresh treated **every** failure (5xx, 429, network) as “no session” (`null`), which bounced the operator to `/login` while the refresh cookie could still be valid.
3. Boot `staleTime: Infinity` never re-ran refresh, so a tab left open past access-token TTL kept an expired Bearer until the next 401.
4. A failed boot query with no cached session was mapped to `unauthenticated`, so a transient refresh outage looked like logout.

ADR-0005 deferred a proactive timer. Access-token TTL is now short enough that on-demand 401 recovery alone is a poor operator experience.

Storage rules from ADR-0002 still stand: do **not** persist the access token or refresh token in `localStorage` / `sessionStorage`. Persistence is the API HttpOnly `refresh_token` cookie.

## 2. Decision Outcomes

### Decision 1: Refresh whenever the access token is missing or unusable

- **Decision**: Before domain requests (and logout / change-password), if the in-memory access token is missing, malformed, or within a short skew of JWT `exp`, call the existing single-flight `POST /v1/authentication/refresh`. Login, register, and refresh paths are exempt so credential posts and boot refresh do not recurse.
- **Rationale**: The refresh cookie is the session. A missing in-memory token (reload, HMR, expiry) is not logout.

### Decision 2: Proactive session refetch from JWT `exp`

- **Decision**: While authenticated, the session query refetches slightly before access-token expiry. Window focus and reconnect refetch with `'always'` only when the current access token is unusable. JWTs without `exp` (mock tokens) do not schedule a timer.
- **Rationale**: Avoids a 401 round-trip on every short TTL; keeps WebSocket and chrome on a fresh Bearer.

### Decision 3: Only a refresh `401` means unauthenticated

- **Decision**: Silent refresh returns `null` only for HTTP 401 (cookie gone or invalid). 5xx, 429, and network errors **throw**. Domain 401 recovery must not `redirectToLogin` on those throws. Boot/query errors with no session data use status `error` and a retry surface; they must not navigate to `/login`.
- **Rationale**: Stay signed in for the refresh-token lifetime. Transient API failure is not “session expired”.

## 3. Alternatives Considered

1. **Persist access token in `localStorage`**: Rejected; ADR-0002 / XSS exposure.
2. **Store JSON-body `refreshToken` in JS**: Rejected; cookie-first contract; refresh token must stay HttpOnly.
3. **Keep 401-only recovery (ADR-0005 timer deferred)**: Rejected; short access TTL makes every idle interval a failed request.

## 4. Consequences

- Access token remains in-memory; reload still bootstraps via the refresh cookie.
- Concurrent callers still share one in-flight refresh promise.
- Refresh 429/5xx can surface as a retryable session error or a failed domain query without clearing the cookie.
- Mock JWTs without `exp` keep 401 recovery as the only refresh trigger.
