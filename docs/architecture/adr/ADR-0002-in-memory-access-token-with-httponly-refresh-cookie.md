# ADR-0002: In-Memory Access Token with HttpOnly Refresh Cookie

- **Status**: Accepted
- **Date**: 2026-08-28
- **Context**: Phase 2 session wiring for `ecommerce-store-api` JWT auth.

---

## 1. Context & Problem Statement

The API uses a dual-token model: short-lived access tokens (Bearer header) and long-lived refresh tokens (HttpOnly cookie). The admin SPA must store credentials safely in the browser and attach tokens consistently to OpenAPI client requests.

Reference: API [JWT-RSA-JWKS.md](https://github.com/raouf-b-dev/ecommerce-store-api/blob/master/docs/security/JWT-RSA-JWKS.md).

## 2. Decision

1. **Access token** is kept in an in-memory module ref (`src/lib/auth/auth-session.ts`) and React Query session cache. Never persist to `localStorage` or `sessionStorage`.
2. **Refresh token** is never read by application JavaScript. The browser sends the API's HttpOnly cookie via `credentials: 'include'` on `apiClient`.
3. **Session bootstrap** calls `POST /v1/authentication/refresh` on app mount through TanStack Query.
4. **Global 401 handling** on non-auth API paths clears the in-memory token and hard-navigates to `/login?redirect=...`.
5. **Login / logout** use OpenAPI auth operations; logout clears in-memory state even if the network call fails.

## 3. Alternatives Considered

1. **`localStorage` for access token** — Rejected: XSS can exfiltrate tokens (OWASP JWT guidance; API security docs).
2. **Refresh token in JSON body stored in JS** — Rejected: API sets HttpOnly cookie; body storage increases XSS exposure.
3. **Silent refresh retry on every 401 mid-request** — Deferred: boot refresh + re-login is sufficient for v1.

## 4. Consequences

- Page refresh drops the access token but can restore session via refresh cookie.
- Cross-origin local dev requires API CORS to allow the admin origin with credentials.
- `apiClient` middleware in `src/lib/api/client.ts` owns Bearer attachment and 401 redirect.
