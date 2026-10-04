# Admin SPA Conventions

Section numbers are cited by ADRs and other docs. Keep them stable when editing.

## 1. Architecture Boundary

- Domain rules live in `ecommerce-store-api`. UI guards, disabled actions, and hidden navigation are UX only.
- Call the API through the OpenAPI-generated client (`src/lib/api/client.ts`). No ad-hoc `fetch` in feature code.
- No workaround: if the OpenAPI contract is wrong, patch the API. Do not match English 403 messages or build dual-dialect clients. Render only contract fields.

## 2. Feature Layout

Feature-owned code lives in `src/features/<feature-name>/`:

```text
src/features/products/
  api/          # OpenAPI wrappers only
  hooks/        # TanStack Query
  components/   # feature UI
  pages/        # one route entry each
  lib/          # URL filters, pure helpers
  schemas/      # Zod (when there is a form)
  types.ts      # aliases to generated OpenAPI types
```

`schemas/` and `hooks/` exist only when the feature has forms or server queries. No barrel `index.ts` files: import the concrete module.

| From / To     | `app/` | `features/*`                  | `lib/`                          | `components/`   |
| :------------ | :----: | :---------------------------- | :-----------------------------: | :-------------: |
| `app/`        | yes    | yes                           | yes                             | yes             |
| `features/A`  | no     | other features (concrete modules) | yes                         | yes             |
| `lib/`        | no     | **no** (ESLint `no-restricted-imports`) | yes                   | yes             |
| `components/` | no     | no (prefer props)             | yes                             | yes             |

- Cross-feature code is imported from the target's concrete module (for example `@/features/roles/hooks/use-roles`). No re-export shims or adapter files.
- **Auth exception:** `features/auth` has no `hooks/` and no session HTTP wrappers. The session Query lives in `AuthProvider` (`src/lib/auth/auth-context.tsx`); session HTTP, redirects, JWT decode, operator access, and the forbidden pages live in `src/lib/auth/`. Do not invent `useAuthQuery`.
- Cross-feature primitives go in `src/components/` (list status in `feedback/`), cross-feature utilities in `src/lib/`.

## 3. Layout and Shell

Cross-feature layout is in `src/components/layout/`: `app-layout.tsx` (`h-screen overflow-hidden` grid, skip link to `#main`, scroll only on `<main>`), `app-sidebar.tsx` (branding is not an `h1`; `NavLink` items from `src/app/navigation.ts`), `app-header.tsx` (mobile menu trigger, `ThemeToggle`), `mobile-nav.tsx` (`Sheet` below `lg`, include `SheetTitle`), and `page-header.tsx` (the page title is the `h1`). Nav config lives in `src/app/navigation.ts` with an optional `permission` per item; active styling uses the `NavLink` `className` callback with `cn()`.

## 4. Page Components

One exported page component per route: `src/features/<name>/pages/<name>-page.tsx`. Pages compose layout sections and feature components and use feature hooks; they hold no API logic. Pages export both a named and a default component and are registered in `src/app/router.tsx` with `lazy(() => import(...))`, never as inline JSX. App-level pages (404) may live in `src/app/pages/`.

## 5. Routing and Auth Guards

Rationale: [ADR-0001](../architecture/adr/ADR-0001-auth-first-routing-and-route-guards.md), [ADR-0006](../architecture/adr/ADR-0006-operators-only-admin-spa.md).

- `/login` is the only public route; no admin chrome on it.
- Shell routes: `ProtectedRoute` -> `RequirePasswordChanged` -> `OperatorRoute` -> `AppLayout` -> feature page (optional `PermissionRoute` for claim-gated pages).
- Admit sessions with `access_admin` only; reject others at login, refresh, and in `OperatorRoute`.
- Guards live in `src/lib/auth/` (`protected-route.tsx`, `guest-route.tsx`, `operator-route.tsx`, `permission-route.tsx`). Session state comes from `AuthProvider` plus the TanStack Query bootstrap refresh.
- Unauthenticated visits redirect to `/login?redirect=<path>`; authenticated `/login` visits go to `redirect` or `/`.

## 5.1 RBAC chrome

Rationale: [ADR-0007](../architecture/adr/ADR-0007-auth-response-permissions-for-chrome.md) (supersedes [ADR-0003](../architecture/adr/ADR-0003-client-rbac-chrome-api-authoritative.md)), [ADR-0006](../architecture/adr/ADR-0006-operators-only-admin-spa.md).

- Admission requires `access_admin` (`ACCESS_ADMIN_PERMISSION`); never hardcode role codes.
- Declare an optional `permission` on nav items; filter with `filterNavigation()` and `useAuth().hasPermission()`.
- `PermissionRoute` gives route-level forbidden UX inside the shell.
- Permission claims for chrome come from the auth token response `permissions` (API-authoritative).

## 6. Responsive Shell

- `lg` and up: fixed 260px sidebar.
- Below `lg`: sidebar hidden; the header hamburger opens nav in a `Sheet`, closed on navigation via `onNavigate` on `AppSidebar`.

## 7. Query and Mutation Rules

- TanStack Query owns server-state caching.
- Key factories per feature (TkDodo style): `all` / `lists()` / `list(filters)` / `details()` / `detail(id)`.
- Mutation success handlers invalidate `lists()` and `detail(id)`, plus `dashboardKeys.all` when widgets would go stale.
- Handle `isError` in the page or widget. No QueryClient `throwOnError`, no `QueryErrorResetBoundary` (dashboard widgets are independent).
- Never cache authorization assumptions separately from the API-backed session.

## 8. Table Query Mapping

Bind TanStack Table pagination, sorting, and filters to URL search params, and map them to the active OpenAPI query schema. Do not hardcode parameter names the contract lacks.

## 9. Forms and Errors

- React Hook Form + Zod, schemas aligned to API DTOs. Show structured API validation errors in the form. Business validation belongs in the API.
- Shared helpers: `getErrorMessage` (dialogs, queries), `applyApiFormErrors` (forms), `ActionErrorAlert` (mutation banners). See [API-INTEGRATION.md](../API-INTEGRATION.md) Error UX.

## 10. Auth and Security

Rationale: [ADR-0002](../architecture/adr/ADR-0002-in-memory-access-token-with-httponly-refresh-cookie.md), [ADR-0005](../architecture/adr/ADR-0005-silent-one-shot-access-token-refresh.md), [ADR-0008](../architecture/adr/ADR-0008-keep-session-alive-for-refresh-token-lifetime.md).

- Browser config is `VITE_*` public values only.
- Access token in memory only; refresh token is an HttpOnly cookie with `credentials: 'include'`. No `localStorage` for long-lived tokens.
- Refresh the access token when it is missing, malformed, or near JWT `exp` (before domain requests, and on a session query timer while authenticated).
- Domain `401`: single-flight silent refresh, one request retry; redirect to login **only** when the refresh itself is `401`. Transient refresh failures keep the session.
- A mid-request refresh updates `AUTH_SESSION_QUERY_KEY` with the new claims and permissions.
- Never silent-retry `/authentication/*` paths. Never pre-refresh login, register, or refresh requests.
- **Safe landing:** `/` and post-login redirects use `IndexLandingGate` and `getDefaultLandingRoute(permissions)` to reach the operator's first permitted route. The Forbidden page CTA links there to avoid loops.
- **Bootstrap retry:** `refreshSessionRequest` returns `null` on `401` (unauthenticated) and throws otherwise. `isClientError` failures are not retried; transient 5xx or network errors retry twice. If the session query still errors with no data, guards show a retry surface instead of bouncing to login.
- Treat rendered API strings as untrusted.

## 11. Concurrency

On `409` reload the entity and let the operator retry. Never silently overwrite server state after a conflict.

## 12. Testing

Procedure, golden specs, and typed-mock patterns: `.agents/skills/write-tests/SKILL.md`. Specs sit beside the UI (`components/__tests__/`, `pages/__tests__/`); page composition specs cover empty, error, and retry. Add Playwright when a feature joins the critical path (`e2e/critical-path.spec.ts`).

## 13. Documentation

Roadmap phase numbers and sequencing belong only in [`docs/ROADMAP.md`](../ROADMAP.md). Other docs describe structure and behavior without phase IDs.

## 14. Architecture Decision Records

Rules (immutable body, supersede, naming, index): [`docs/architecture/adr/README.md`](../architecture/adr/README.md). When to write one: `.agents/skills/write-docs/SKILL.md`.

## 15. Mock Mode and Boundaries

- Mock infrastructure lives only under `src/lib/mock/` (handlers, seed, worker, demo UI). Feature modules must not import `@/lib/mock/*`.
- Allowed touchpoints:
  - `src/main.tsx`: dynamic `import('@/lib/mock/browser')` behind an inline `import.meta.env` mock gate (same conditions as `isMockMode()`), so production Rollup drops the MSW chunk.
  - `LoginPage`: lazy-loads demo chrome from `@/lib/mock/ui/` only when `isMockMode()` is true.
  - `AppLayout`: lazy-loads the demo-data banner from `@/lib/mock/ui/` only when `isMockMode()` is true.
- MSW is never a static import on production entry paths; `vite build` must not emit the mock chunk.
- Playwright targets a real seeded API. Mock mode is for local evaluation and static demos.
- A feature `api/` file may expose a preset query facade (for example `listRecentOrdersForDashboard`) that calls another feature's request with fixed filters. That is not a banned re-export shim.

## 16. Theme System

- Location `src/components/theme/`. Themes `light` | `dark` | `system`, stored under `THEME_STORAGE_KEY = 'admin-ui-theme'`.
- An inline script in `index.html` sets the `.dark` class before React loads (no flash).
- `ThemeProvider` tracks `prefers-color-scheme` with `useSyncExternalStore`.
- `ThemeAwareToaster` binds `resolvedTheme` to Sonner.

## 17. Real-Time WebSocket Feed

- Location `src/lib/ws/`. `socket.io-client` targets the API root origin with the Bearer token in `auth.token`.
- `WebSocketProvider` in the shell connects on an authenticated session and disconnects on unmount or logout.
- Events use `NotificationEnvelope`; match with `isOrderNotification` and `isInventoryNotification`.
- Query key factories used here live in `src/lib/query-keys/` (`orderKeys`, `inventoryKeys`, `dashboardKeys`); feature hooks import the same modules. Do not re-export them from `features/*/hooks`.
- Events raise Sonner toasts and invalidate `orderKeys.lists()`, `inventoryKeys.all`, and `dashboardKeys.all`.
- In dev and mock mode `window.dispatchMockNotification` simulates events without a gateway.

## 18. Composable RFC 9110 Error Helpers

Location `src/lib/api/parse-api-error.ts`. Prefer these over casts (`error as ApiRequestError`) or direct status access:

- `getErrorStatusCode(error)`: status from `ApiRequestError`, `AuthRequestError`, `Response`, or objects with `.statusCode` or `.status`.
- `isStatusInRange(error, min, max)`, `hasHttpStatus(error, ...codes)`, `isClientError(error)` (400-499), `isServerError(error)` (500-599), `isOptimisticLockConflict(error)` (409).

## 19. ASCII prose (docs and comments)

Docs, Markdown, and source comments read as if typed in a plain editor. `npm run lint` runs `scripts/lint-ascii-prose.cjs` on Markdown (except immutable `docs/architecture/adr/`) and on comments in `ts`, `tsx`, and `js`; `ascii-prose/no-smart-punctuation` flags the same marks in the editor.

| Avoid                                 | Use                                       |
| :------------------------------------ | :---------------------------------------- |
| Em dash (U+2014)                      | `-`, `:`, or a new sentence               |
| En dash (U+2013)                      | ASCII `-` in ranges (`8b-8c`, `400-499`)  |
| Curly quotes (U+2018/2019/201C/201D)  | `'` and `"`                               |
| Ellipsis character (U+2026)           | `...`                                     |
| Non-breaking space or hyphen          | normal space or `-`                       |

No emoji in comments. New user-visible strings follow the same habit.
