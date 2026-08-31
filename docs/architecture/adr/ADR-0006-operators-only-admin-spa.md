# ADR-0006: Admin SPA Access via `access_admin` Permission

- **Status**: Accepted
- **Date**: 2026-08-29
- **Deciders**: Engineering Core Team
- **Context**: Admin dashboard must not admit accounts without operator SPA access; complements [ADR-0001](ADR-0001-auth-first-routing-and-route-guards.md) and [ADR-0003](ADR-0003-client-rbac-chrome-api-authoritative.md)
- **Does not supersede**: ADR-0001, ADR-0003

---

## 1. Context & Problem Statement

The API issues JWTs for system roles such as `SUPER_ADMIN`, `ADMIN`, and `CUSTOMER`. Nav filtering hid links for customers, but `ProtectedRoute` only checked authentication. A customer login could still reach the shell (empty nav + unprotected Dashboard/Orders placeholders).

Hardcoding allowed role codes (`SUPER_ADMIN` | `ADMIN`) would block future custom roles that should use the SPA. Admission must be **permission-based**, aligned with API RBAC.

## 2. Decision Outcomes

### Decision 1: Gate on `access_admin`

- **Decision**: The API defines system permission `access_admin` (“Access the operator admin dashboard SPA”). System roles `SUPER_ADMIN` and `ADMIN` receive it; `CUSTOMER` does not. The SPA admits a session only when UX-resolved permissions include `access_admin` (constant `ACCESS_ADMIN_PERMISSION`), not by comparing role name strings.
- **Rationale**: Custom roles can be granted SPA entry without code changes. Role names stay an identity concern; capabilities stay permissions (ADR-0003).

### Decision 2: Reject at login and refresh

- **Decision**: After a successful login/refresh token response, if the session lacks `access_admin`, call logout (clear HttpOnly refresh cookie), clear the in-memory access token, and fail the session (`NotOperatorError` on login; `null` on refresh). Login form shows a dedicated message distinct from bad credentials.
- **Rationale**: Defense in depth at the earliest session boundary; avoids leaving a valid refresh cookie for a non-admin SPA session.

### Decision 3: Shell `OperatorRoute` + page `PermissionRoute`s

- **Decision**: Guard stack is `ProtectedRoute` → `RequirePasswordChanged` → `OperatorRoute` → `AppLayout`. `OperatorRoute` checks `hasPermission('access_admin')`. Denied users see a minimal page outside chrome (sign out only; no “Back to dashboard”). Dashboard `/` and `/orders` require `view_all_orders` via `PermissionRoute`.
- **Rationale**: Complements claim-based chrome (ADR-0003) with an explicit SPA admission gate and closes placeholder routes that previously lacked permission checks.

## 3. Alternatives Considered

1. **Hardcode `SUPER_ADMIN` / `ADMIN` role codes**: Rejected: couples the SPA to system role names; blocks custom operator roles.
2. **Admit if any `view_all_*` is present**: Rejected: conflates domain read access with SPA admission.
3. **`view_admin_dashboard` / `manage_admin_dashboard` pair**: Deferred: one admission permission is enough; domain pages already use `view_*` / `manage_*`.
4. **Nav filtering only**: Rejected: customers still entered the shell.
5. **Reuse `ForbiddenPage` inside the shell**: Rejected: that page links back to dashboard and assumes shell chrome.

## 4. Consequences

- Seeded `customer@store.local` cannot use Control Center.
- Granting `access_admin` to a custom role (API) plus mirroring it in the SPA UX map (until a profile/permissions API exists) admits that role.
- Operators still rely on API authorization for every domain call (ADR-0003).
- Change-password remains outside `OperatorRoute` (authenticated + must-change gate only) so operators can rotate passwords before entering the shell.
- API permission bootstrap / system role sync must include `access_admin` on operator system roles.
