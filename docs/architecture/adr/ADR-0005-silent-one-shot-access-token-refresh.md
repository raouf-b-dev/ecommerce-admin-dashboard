# ADR-0005: Silent One-Shot Access Token Refresh on Domain 401

- **Status**: Accepted
- **Date**: 2026-08-29
- **Deciders**: Engineering Core Team
- **Context**: Mid-request expired access tokens while an HttpOnly refresh cookie remains valid; extends [ADR-0002](ADR-0002-in-memory-access-token-with-httponly-refresh-cookie.md)
- **Does not supersede**: ADR-0002 (in-memory access token, HttpOnly refresh cookie, no `localStorage`)

---

## 1. Context & Problem Statement

ADR-0002 deferred mid-request silent refresh: on domain `401`, the SPA cleared the access token and hard-navigated to `/login`. That is correct when the refresh cookie is gone, but it forces a full re-login when only the short-lived access token expired.

Operators stay on a page for longer than the access-token TTL. Domain calls then fail with `401` even though `POST /v1/authentication/refresh` would succeed. We need a single, bounded recovery path that does not create refresh storms or retry loops.

## 2. Decision Outcomes

### Decision 1: One silent refresh + one request retry

- **Decision**: On a non-authentication `401`, attempt `POST /v1/authentication/refresh` once (single-flight across concurrent callers), store the new access token in memory, and retry the original request once. If refresh fails or the retry still returns `401`, clear the access token and redirect to `/login?redirect=...`.
- **Rationale**: Restores the session when the cookie is still valid without changing storage (ADR-0002). A hard cap of one retry prevents hammering protected endpoints.

### Decision 2: Never silent-retry authentication paths

- **Decision**: Paths under `/authentication/` never trigger silent refresh from the client middleware (login, refresh, logout, change-password own their status handling).
- **Rationale**: Avoids recursive refresh and preserves explicit login/refresh failure UX.

### Decision 3: Refresh uses raw `fetch`, not `apiClient`

- **Decision**: Silent refresh is implemented in `src/lib/api/silent-refresh.ts` with `credentials: 'include'` and does not re-enter `apiClient` middleware.
- **Rationale**: Prevents middleware recursion and keeps the refresh call independent of Bearer attachment on an already-expired token.

## 3. Alternatives Considered

1. **Keep ADR-0002 hard redirect only**: Rejected: poor operator UX for routine access-token expiry.
2. **Retry loops / unbounded refresh**: Rejected: can amplify load and obscure real auth failures.
3. **Proactive refresh on a timer**: Deferred: more moving parts; on-demand recovery is enough for current TTLs.

## 4. Consequences

- Domain `401` may briefly pause while a shared refresh completes.
- Concurrent domain `401`s share one in-flight refresh promise.
- Token storage rules from ADR-0002 remain unchanged.
- Boot/session restore still uses TanStack Query `refreshSessionRequest`; this ADR only covers mid-request recovery.
