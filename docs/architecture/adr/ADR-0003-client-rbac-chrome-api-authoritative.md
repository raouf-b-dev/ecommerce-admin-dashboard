# ADR-0003: Client RBAC Chrome — API Authoritative

- **Status**: Accepted
- **Date**: 2026-08-28
- **Context**: Phase 2 permission-aware navigation and forbidden UX.

---

## 1. Context & Problem Statement

Operators expect navigation and pages to reflect their permissions. The SPA must improve UX without becoming a second authorization layer that could drift from API policy.

JWT access tokens carry `role` but not individual permission codes. The API resolves permissions server-side per request via `PermissionsGuard`.

## 2. Decision

1. **API responses are authoritative.** `401` → login; `403` → forbidden UX. No client bypass or retry loops that hammer protected endpoints.
2. **Nav filtering** uses optional `permission` on items in `src/app/navigation.ts`, filtered by claims from `useAuth().hasPermission()`.
3. **Route-level gates** use `PermissionRoute` to render a forbidden page inside the shell when a required claim is missing.
4. **Permission claims for chrome** are derived from JWT `role` mapped through a UX-only system-role table (`src/features/auth/constants/system-role-permissions.ts`) aligned with API `SYSTEM_ROLES`. Custom roles may show reduced chrome until a dedicated profile/permissions API exists.
5. **Do not invent permissions** or enforce domain rules in the SPA.

## 3. Alternatives Considered

1. **Decode permissions from JWT** — Not available in current API token payload.
2. **Fetch `/roles` for every session** — Rejected for v1: requires `manage_roles`, which administrators lack by design.
3. **Show all nav items always** — Rejected: poor UX; operators click into guaranteed 403s.

## 4. Consequences

- Seeded `ADMIN` role hides `manage_roles` nav and shows forbidden UX on `/settings/roles`.
- Feature pages in Phase 3+ add control-level gates; API still validates every mutation.
- If API role definitions change, update the UX map or add a profile endpoint in a future phase.
