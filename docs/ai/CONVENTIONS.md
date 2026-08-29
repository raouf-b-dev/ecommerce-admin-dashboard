# Admin SPA Conventions

## 1. Architecture Boundary

- Keep domain rules in `ecommerce-store-api`.
- UI guards, disabled actions, and hidden navigation are UX only.
- Prefer the OpenAPI-generated client for API calls. Do not spread ad-hoc `fetch` calls through feature code.

## 2. Feature Layout

Use `src/features/<feature-name>/` for feature-owned code.

Typical shape:

```text
src/features/products/
  api/
  components/
  hooks/
  schemas/
  types/
```

Keep cross-feature primitives in `src/components/` and cross-feature utilities in `src/lib/`.

## 3. Layout and Shell

Cross-feature layout lives in `src/components/layout/`:

- `app-layout.tsx` — `h-screen overflow-hidden` grid; scroll only on `<main>`
- `app-sidebar.tsx` — branding + `NavLink` items from `src/app/navigation.ts`
- `app-header.tsx` — header chrome + mobile menu trigger
- `mobile-nav.tsx` — shadcn `Sheet` for `<lg` viewports; include `SheetTitle` for a11y
- `page-header.tsx` — reusable page title + description (+ optional actions slot)

Nav config is centralized in `src/app/navigation.ts` with optional `permission` per item (filtered by claims once auth is wired).

Active nav styling uses React Router `NavLink` with a `className` callback and `cn()`.

## 4. Page Components

Each route gets one exported page component under `src/features/<name>/pages/<name>-page.tsx`.

Pages compose layout sections and feature components. They do not contain API logic directly — use feature hooks and query helpers.

Register pages in `src/app/router.tsx` with a single import; do not define page JSX inline in the router.

App-level pages (e.g. 404) may live in `src/app/pages/`.

## 5. Routing and Auth Guards

Rationale: [ADR-0001](../architecture/adr/ADR-0001-auth-first-routing-and-route-guards.md), [ADR-0006](../architecture/adr/ADR-0006-operators-only-admin-spa.md).

- `/login` is the sole public route in v1; no admin chrome on login
- Shell routes: `ProtectedRoute` → `RequirePasswordChanged` → `OperatorRoute` → `AppLayout` → feature page (optional `PermissionRoute` for claim-gated pages)
- Admit sessions with `access_admin` only; reject others at login/refresh and via `OperatorRoute`
- Route guards live in `src/lib/auth/` (`protected-route.tsx`, `guest-route.tsx`, `operator-route.tsx`, `permission-route.tsx`)
- Session state comes from `AuthProvider` + TanStack Query bootstrap refresh
- Client guards are UX only; the API enforces authorization
- Unauthenticated protected visits redirect to `/login?redirect=<path>`
- Authenticated `/login` visits redirect to `redirect` query param or `/`

## 5.1 RBAC chrome

Rationale: [ADR-0003](../architecture/adr/ADR-0003-client-rbac-chrome-api-authoritative.md), [ADR-0006](../architecture/adr/ADR-0006-operators-only-admin-spa.md).

- SPA admission requires `access_admin` (`ACCESS_ADMIN_PERMISSION`); do not hardcode role codes
- Declare optional `permission` on nav items in `src/app/navigation.ts`
- Filter sidebar items with `filterNavigation()` and `useAuth().hasPermission()`
- Use `PermissionRoute` for route-level forbidden UX inside the shell
- Permission claims for chrome come from auth token response `permissions` (API-authoritative)

## 6. Responsive Shell

- `lg+`: fixed 260px sidebar visible
- `<lg`: sidebar hidden; hamburger in header opens nav in a `Sheet`
- Close sheet on navigation via `onNavigate` callback on `AppSidebar`

## 7. Query and Mutation Rules

- TanStack Query owns server-state caching.
- Query keys should be stable tuples with the feature name first.
- Mutation success handlers must invalidate or update the exact affected queries.
- Do not cache authorization assumptions separately from API-backed session state.

## 8. Table Query Mapping

- Bind TanStack Table pagination, sorting, and filter state to URL search params.
- Map those params to whatever the active OpenAPI query schema defines.
- Do not hardcode query parameter names that are not present in the contract.

## 9. Forms and Errors

- Use React Hook Form + Zod for form state and client validation.
- Align schemas to API DTOs.
- Display structured API validation errors in the form when possible.
- Do not invent business validation rules that belong in the API.

## 10. Auth and Security

Rationale: [ADR-0002](../architecture/adr/ADR-0002-in-memory-access-token-with-httponly-refresh-cookie.md), [ADR-0005](../architecture/adr/ADR-0005-silent-one-shot-access-token-refresh.md).

- Browser configuration uses `VITE_*` public values only.
- Access token in memory only; refresh token via HttpOnly cookie + `credentials: 'include'`.
- Avoid `localStorage` for long-lived tokens.
- Domain `401`: single-flight silent refresh + one request retry; if that fails, clear session and return to login.
- Never silent-retry `/authentication/*` paths.
- Treat rendered API strings as untrusted data.

## 11. Concurrency

- When the API returns `409`, reload the entity and let the operator retry.
- Do not silently overwrite server state after a conflict.

## 12. Testing

- Add component tests alongside the UI they cover.
- Extend Playwright smoke when a feature joins the critical path.
- Keep tests focused on user-visible behavior and contract wiring.

## 13. Documentation

- Roadmap phase numbers and delivery sequencing belong only in [`docs/ROADMAP.md`](../ROADMAP.md).
- Other docs describe structure, conventions, and behavior without referencing roadmap phases.

## 14. Architecture Decision Records

Follow [`docs/architecture/adr/README.md`](../architecture/adr/README.md) (aligned with `ecommerce-store-api`):

- Naming: `ADR-XXXX-[short-title].md` (4-digit zero-padded).
- **Body is immutable.** Do not rewrite Context, Decisions, Alternatives, or Consequences on an existing ADR.
- **Status (and supersede links) may change** in the file header and index only — e.g. set `Superseded` and `Superseded By: ADR-XXXX` when a later ADR fully replaces it.
- Extending a decision (prior ADR still stands) → new ADR with `Does not supersede`; leave the prior ADR `Accepted`.
- Full replacement → new ADR with `Supersedes`; mark the old ADR `Superseded` (header Status + index). Never rewrite the old Decisions.
- Lifecycle: `Proposed` | `Accepted` | `Deprecated` | `Superseded`.
- Always update the ADR index (`Supersedes` / `Superseded By` columns) when adding or superseding a record.
