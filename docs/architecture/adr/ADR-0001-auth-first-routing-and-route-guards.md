# ADR-0001: Auth-First Routing and Route Guards

- **Status**: Accepted
- **Date**: 2026-08-28
- **Context**: Phase 1.5 established route shape; Phase 2 wires session checks.

---

## 1. Context & Problem Statement

Admin operators must not see navigation chrome, placeholder pages, or layout structure without a valid session. The SPA also needs predictable redirect behavior after login and when sessions expire mid-flight.

## 2. Decision

1. **`/login` is the sole public route in v1.** It renders outside `AppLayout` with no sidebar or header chrome.
2. **All other routes** render only after `ProtectedRoute` confirms an authenticated session, then through `AppLayout`.
3. **Unauthenticated visits** to protected paths redirect to `/login?redirect=<original-path>`.
4. **Authenticated visits** to `/login` redirect to the `redirect` query param when safe (must start with `/`, not `//`), otherwise `/`.
5. **`GuestRoute` and `ProtectedRoute`** show a loading screen while the session bootstrap query runs to avoid shell flash.

## 3. Alternatives Considered

1. **Render shell with disabled nav before auth**: Rejected: leaks admin structure to unauthenticated visitors and complicates loading states.
2. **Use `/` as the login URL**: Rejected: explicit `/login` simplifies 401 redirects, bookmarks, and Playwright flows.

## 4. Consequences

- Route guards live in `src/lib/auth/`.
- E2E tests must expect redirect-to-login for unauthenticated `/` visits.
- Implementation patterns documented in `docs/ai/CONVENTIONS.md` §5.
