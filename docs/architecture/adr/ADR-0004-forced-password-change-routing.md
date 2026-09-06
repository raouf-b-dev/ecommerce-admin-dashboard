# ADR-0004: Forced Password Change Routing

- **Status**: Accepted
- **Date**: 2026-08-29
- **Context**: API Phase 14b (`mustChangePassword`); admin Phase 2.5

---

## 1. Context & Problem Statement

Seeded and bootstrap credentials require mandatory password rotation before normal admin use. The SPA must route operators to a dedicated change-password flow without exposing the full admin shell, while remaining authenticated enough to call the change-password API.

## 2. Decision

1. **`/change-password` is authenticated but outside `AppLayout`.** No sidebar, header chrome, or domain navigation until rotation completes.
2. **`ProtectedRoute` wraps `/change-password`.** Unauthenticated visitors still redirect to `/login`.
3. **`RequirePasswordChanged` wraps shell routes.** When `mustChangePassword === true`, any shell path redirects to `/change-password`.
4. **`ChangePasswordRoute` guards the change-password page.** When the flag is false, redirect to `/` or a safe `redirect` query param.
5. **Session flag source:** login, refresh, and change-password response bodies; OR the access-token `mustChangePassword` claim when present (defense in depth).
6. **API is authoritative.** `MustChangePasswordGuard` returns 403 (`MUST_CHANGE_PASSWORD`) on domain routes. The admin `apiClient` redirects to `/change-password` on that code as a second layer.

## 3. Alternatives Considered

1. **Embed change-password inside `AppLayout`**: Rejected: exposes navigation chrome and implies access to domain areas before rotation.
2. **Public change-password route**: Rejected: change-password requires an authenticated session and current password verification.
3. **Client-only gate without API enforcement**: Rejected: API hard gate is required; client routing is UX only (see ADR-0003).

## 4. Consequences

- Complements [ADR-0001](ADR-0001-auth-first-routing-and-route-guards.md) (auth-first routing) and [ADR-0002](ADR-0002-in-memory-access-token-with-httponly-refresh-cookie.md) (token storage).
- Playwright forced-rotation spec uses `superadmin@store.local` so smoke tests can keep using `admin@store.local` via `loginAsAdmin`.
- Re-seeding demo credentials restores documented passwords and re-enables rotation locally (API `SEEDING.md`).
