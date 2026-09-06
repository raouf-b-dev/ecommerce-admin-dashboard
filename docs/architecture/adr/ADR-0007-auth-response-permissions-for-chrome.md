# ADR-0007: Auth Response Permissions for Chrome and Admission

- **Status**: Accepted
- **Date**: 2026-08-29
- **Deciders**: Engineering Core Team
- **Context**: Live role permissions on login / refresh / change-password; replaces the UX system-role map in [ADR-0003](ADR-0003-client-rbac-chrome-api-authoritative.md); supplies the permission source used by [ADR-0006](ADR-0006-operators-only-admin-spa.md)
- **Supersedes**: ADR-0003
- **Does not supersede**: ADR-0001, ADR-0006 (admission still gates on `access_admin` via `OperatorRoute` / login reject)

---

## 1. Context & Problem Statement

ADR-0003 derived SPA permission claims from JWT `role` through a client system-role table. That map blocked custom roles with `access_admin` from entering the SPA, drifted from API seeds, and duplicated `SYSTEM_ROLES`.

The API now returns `permissions: string[]` on login, refresh, and change-password (DB-resolved for the user’s role, same source as `PermissionsGuard`). JWT remains role-only.

Nav filtering, `PermissionRoute`, and “API responses are authoritative” from ADR-0003 still apply; only the **source** of permission claims changes. ADR-0006’s `access_admin` admission rule still applies; that permission is now read from the auth response array instead of the deleted UX map.

## 2. Decision Outcomes

### Decision 1: Permissions from auth token responses

- **Decision**: Parse `permissions` from login / refresh / change-password into `AuthSession.permissions`. Delete the client `system-role-permissions` map. Do not invent permission codes in the SPA.
- **Rationale**: One source of truth with the API; custom roles work without SPA code changes; refresh re-queries DB so role/permission edits apply without a full re-login.

### Decision 2: Chrome and admission use the same session array

- **Decision**: `useAuth().hasPermission()`, nav filtering, `PermissionRoute`, and ADR-0006’s `access_admin` gate all read `AuthSession.permissions` from Decision 1.
- **Rationale**: Avoids a second derivation path; admission and chrome stay aligned with the same payload.

### Decision 3: Restate unchanged chrome rules from ADR-0003

- **Decision**: Keep: API `401` / `403` are authoritative; optional `permission` on nav items; `PermissionRoute` for missing claims; do not invent domain authorization in the SPA.
- **Rationale**: Those decisions remain valid; only claim sourcing changed.

### Decision 4: `GET /v1/roles` is for display/filter UX, not session chrome

- **Decision**: Role name/filter UI may load `GET /v1/roles` (readable with `view_all_users` or `manage_roles`). Do not use that list to build the session permission set.
- **Rationale**: Separates catalog UX from auth chrome; avoids coupling admission to a second round-trip.

## 3. Alternatives Considered

1. **Keep ADR-0003 UX system-role map**: Rejected: custom `access_admin` roles could not enter; map drifted from API.
2. **Put permission codes in the JWT**: Deferred: larger token surface; auth response array is enough for chrome.
3. **Fetch `/roles` (or a profile endpoint) on every session for permissions**: Rejected for chrome: auth already returns the live set; `/roles` remains for name/filter UX only.
4. **Amend ADR-0003 / ADR-0006 bodies in place**: Rejected: ADR bodies are immutable ([CONVENTIONS.md](../../ai/CONVENTIONS.md) §14).

## 4. Consequences

- Custom / non-system roles with `access_admin` can enter the SPA without a client map entry.
- Role permission changes apply on the next refresh (or re-login / change-password).
- ADR-0003 is historical (`Superseded`); cite this ADR for permission claim sourcing.
- ADR-0006 remains the admission ADR; its “UX-resolved permissions” wording is satisfied by this auth-response source.
- Feature pages still add control-level gates; API remains authoritative on every mutation.
