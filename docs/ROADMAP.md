# E-commerce Admin Dashboard: Roadmap

> Delivery plan for the admin SPA. Work top to bottom.
>
> Companions: [README.md](../README.md), [API-INTEGRATION.md](API-INTEGRATION.md), [ecommerce-store-api](https://github.com/raouf-b-dev/ecommerce-store-api)., [ecommerce-store-web](https://github.com/raouf-b-dev/ecommerce-store-web).

---

## How to use this file

- `[ ]` not started
- `[/]` in progress
- `[x]` done
- Finish each phase before starting the next. Phase 12 (payments) is optional: skip it or do it after Phase 13.
- Keep domain rules and auth enforcement in the API.
- Contracts: live OpenAPI/Swagger + generated client. [API-INTEGRATION.md](API-INTEGRATION.md) is client rules only (not an endpoint list).

### Testing policy

Write tests **with** each feature.

| Layer                 | When                                                  |
| :-------------------- | :---------------------------------------------------- |
| Unit / component      | Same phase as the UI                                  |
| Playwright            | Extend smoke when the feature joins the critical path |
| Cross-cutting quality | Phase 8 only                                          |

### Definition of done (every feature phase)

1. Wired to OpenAPI operations for that phase’s capabilities.
2. Listed tests green.
3. Lint + typecheck clean.
4. RBAC: UI may hide controls; API remains the authority.
5. Integration doc still accurate for that phase.

---

## Stack

| Concern        | Choice                                        |
| :------------- | :-------------------------------------------- |
| App            | Vite + React 19 + TypeScript strict           |
| Routing        | React Router                                  |
| Styling        | Tailwind CSS + shadcn/ui                      |
| Client data    | TanStack Query                                |
| Tables         | TanStack Table                                |
| Local UI state | React state; Zustand when needed across trees |
| Forms          | React Hook Form + Zod                         |
| Charts         | Recharts (dashboard widgets)                  |
| API            | Typed client from OpenAPI / Swagger           |
| Tests          | Vitest + Testing Library + Playwright         |

**Ports:** admin `5174`, API `3000` (or remapped API `PORT` on hosts that reserve `3000–3199`).

---

## Phase overview

| Phase   | Name                            | Status | Focus                                                                  |
| ------- | ------------------------------- | ------ | ---------------------------------------------------------------------- |
| **0**   | Foundation                      | `[x]`  | Vite scaffold, tooling, tests, OpenAPI client                          |
| **1**   | Agent ecosystem and conventions | `[x]`  | AGENT policy, context, AI docs, adapters                               |
| **1.5** | Shell and page structure        | `[x]`  | Layout extraction, feature pages, responsive nav, auth route shape     |
| **2**   | Auth and RBAC chrome            | `[x]`  | Login, permission-aware nav + tests                                    |
| **2.5** | Forced password change          | `[x]`  | `/change-password`, session flag, API guard integration                |
| **2.6** | Operator gate + silent refresh  | `[x]`  | Operators-only SPA; domain 401 one-shot refresh                        |
| **3**   | Products                        | `[x]`  | Table/forms + tests                                                    |
| **4**   | Inventory                       | `[x]`  | Stock views + tests                                                    |
| **5**   | Orders                          | `[x]`  | Ops actions + tests                                                    |
| **6**   | Users                           | `[x]`  | Read views + role filter + tests                                       |
| **7**   | Dashboard                       | `[x]`  | Operational cockpit (analytics API + Recharts)                         |
| **8**   | Quality sweep                   | `[x]`  | Journey, a11y, consistency, CI e2e policy                              |
| **9**   | Query parity                    | `[ ]`  | Expose every list query param this API version already accepts         |
| **10**  | Existing writes                 | `[ ]`  | Wire OpenAPI writes already shipped (users, products delete, roles UI) |
| **11**  | API gaps then SPA               | `[ ]`  | Product activate/deactivate + assign user role (API first)             |
| **12**  | Payments ops                    | `[ ]`  | Optional; does not block the release gate                              |
| **13**  | Release gate                    | `[ ]`  | Deploy after Phases 9–11; verified quick start                         |

---

## Phase 0: Foundation

> Runnable Vite app with toolchain and test harness.

**OpenAPI capabilities:** health / readiness (discover exact paths in Swagger).

**Scope:**

- [x] Scaffold Vite React-TS
- [x] Tailwind + shadcn/ui + app shell (sidebar/topbar)
- [x] React Router skeleton
- [x] `.env.example` with `VITE_API_BASE_URL=http://localhost:3000` (no secrets)
- [x] `.gitignore` ignores `.env` and other secret files
- [x] OpenAPI typed client stub + regenerate script
- [x] Vitest + Testing Library sample test
- [x] Playwright placeholder smoke
- [x] Scripts: `dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`
- [x] CI: lint, typecheck, unit tests
- [x] Dev server on port **5174** (or document the chosen port)

**Done when:** clean install passes lint/typecheck/test; `npm run dev` shows the shell.

---

## Phase 1: Agent ecosystem and conventions

> Same idea as the API agent system, sized for a Vite SPA.

### Files to create (minimal outline)

| File                                          | Purpose                                          |
| :-------------------------------------------- | :----------------------------------------------- |
| `AGENT.md`                                    | Authority order + non-negotiables                |
| `.agents/PROJECT-CONTEXT.md`                  | Stack, folders, RBAC UX notes, API links         |
| `docs/ai/README.md`                           | Index                                            |
| `docs/ai/CONVENTIONS.md`                      | Feature folders, Query/Table/forms, 409 handling |
| `docs/ai/GOVERNANCE-AND-QUALITY-GATES.md`     | Merge gates                                      |
| `docs/ai/WORKFLOW-PLAYBOOK.md`                | Task intake -> verify                            |
| `AGENTS.md` / `CLAUDE.md` / `.cursor/rules/*` | Thin adapters to `AGENT.md`                      |

### `AGENT.md` non-negotiables (must include)

1. No domain rules in the SPA.
2. RBAC chrome is UX only; API enforces authorization.
3. Prefer OpenAPI client for domain calls.
4. Require verification for behavior changes.
5. No push/publish/production config changes without explicit confirmation.

### `docs/ai/CONVENTIONS.md` must cover

- `src/features/<name>/` layout
- Query key + mutation invalidation patterns
- TanStack Table conventions
- Form + Zod alignment to API DTOs
- HTTP 409 OCC reload-and-retry UX

**Scope checklist:**

- [x] Create all files above
- [x] Link from README docs table
- [x] Adapters do not fork policy

**Done when:** `AGENT.md` + `PROJECT-CONTEXT.md` are enough to start a feature phase safely.

---

## Phase 1.5: Shell and page structure

> Extract layout, establish feature page folders, and lock in auth-first routing shape before Phase 2.

**Scope:**

- [x] Extract `AppLayout`, `AppSidebar`, `AppHeader`, `MobileNav`, `PageHeader` under `src/components/layout/`
- [x] Move placeholder pages to `src/features/*/pages/`
- [x] Slim `router.tsx` to route map only (imports page components; no inline page JSX)
- [x] `/login` outside admin shell; sole public route in v1
- [x] `ProtectedRoute` / `GuestRoute` stubs under `src/lib/auth/` (passthrough until Phase 2)
- [x] Protected route tree: `ProtectedRoute` → `AppLayout` for all admin routes
- [x] Responsive mobile nav (shadcn `Sheet` on `<lg`; `SheetTitle` for a11y)
- [x] Scroll on `<main>` only (`h-screen overflow-hidden` shell)
- [x] Component + Playwright tests
- [x] Update conventions docs

**Done when:** all routes work; mobile nav functional; auth route shape in place; tests green; docs updated.

---

## Phase 2: Auth and RBAC chrome

> Builds on Phase 1.5 shell. Wire session logic into existing route guards and nav config.

**OpenAPI capabilities:** admin login/session; permission/role reads if needed for chrome.

**Seeded user:** administrator from API [`SEEDING.md`](https://github.com/raouf-b-dev/ecommerce-store-api/blob/master/docs/development/SEEDING.md) (do not paste passwords into this repo)

**Scope:**

- [x] Login (RHF + Zod)
- [x] Session persistence matching the API
- [x] Wire `ProtectedRoute` / `GuestRoute` to API session (stubs from Phase 1.5)
- [x] Unauthenticated access to any protected path → `/login?redirect=...`
- [x] Post-login redirect to `redirect` query param or `/`
- [x] Global `401` handler on `apiClient`
- [x] Nav filtered by permission claims in `src/app/navigation.ts` (UX only)
- [x] 401 -> login; 403 -> forbidden
- [x] Component tests: validation, guard, forbidden
- [x] Playwright: login success and failure
- [x] Architecture docs + ADRs (`docs/architecture/`)

**Done when:** Seeded admin reaches the shell; unauthenticated user cannot see admin shell or placeholder pages; forbidden route shows 403 UX; tests green.

---

## Phase 2.5: Forced password change

> Requires API Phase 14b (`mustChangePassword` enforcement). Uses seeded accounts from API [`SEEDING.md`](https://github.com/raouf-b-dev/ecommerce-store-api/blob/master/docs/development/SEEDING.md).

**Scope:**

- [x] Parse `mustChangePassword` on login, refresh, and change-password responses
- [x] `/change-password` route (minimal layout, no shell)
- [x] `RequirePasswordChanged` / `ChangePasswordRoute` guards
- [x] Change-password form (RHF + Zod) wired to API
- [x] Global 403 `MUST_CHANGE_PASSWORD` redirect on `apiClient`
- [x] Component tests for guards and validation
- [x] Playwright: seeded user forced change then reaches dashboard (when seed available)
- [x] Sign out on `/change-password` (stay on the page; no skip into the shell)
- [x] Update `docs/API-INTEGRATION.md`

**Done when:** Seeded user with `mustChangePassword: true` lands on change-password, updates password, and reaches the dashboard shell; tests green.

---

## Phase 2.6: Operator gate + silent access-token refresh

> Operators-only admin SPA and mid-request silent refresh. ADRs: [ADR-0005](architecture/adr/ADR-0005-silent-one-shot-access-token-refresh.md), [ADR-0006](architecture/adr/ADR-0006-operators-only-admin-spa.md). Do not amend ADR-0002 body.

**Scope:**

- [x] Gate on `access_admin` (not hardcoded role codes); reject missing permission on login/refresh (logout clears cookie)
- [x] Login form message for accounts without admin access
- [x] `OperatorRoute` on shell (`access_admin`); Dashboard `/` and `/orders` behind `PermissionRoute` (`view_all_orders`)
- [x] Single-flight silent refresh + one domain request retry on `401`
- [x] Unit/component + Playwright (customer blocked; admin OK)
- [x] ADR-0005 / ADR-0006 + conventions/governance ADR immutability notes

**Done when:** Seeded customer cannot enter Control Center; seeded admin can; expired access token recovers via one refresh without login when the cookie is valid; tests green.

---

## Phase 3: Products

**OpenAPI capabilities:** product list/detail and product writes.

**Scope:**

- [x] Product table (TanStack Table)
- [x] Create/edit forms aligned to API DTOs
- [x] Query invalidation after mutations
- [x] HTTP 409 OCC: reload and retry
- [x] Component tests for validation and 409 messaging
- [x] Playwright: list + open create/edit

**Done when:** Admin can create/edit a product via API; 409 path is covered by a test or documented manual check with follow-up issue.

> Note: Live concurrent-edit 409 is unit/component covered via mocked `OPTIMISTIC_LOCK_CONFLICT`. End-to-end dual-session OCC remains a follow-up if needed.

---

## Phase 4: Inventory

**OpenAPI capabilities:** inventory reads (and adjust/low-stock if you ship them in v1).

**Scope:**

- [x] Stock list/detail from API read models
- [x] Low-stock view if useful
- [x] Adjust stock only if product needs it in v1
- [x] Empty/error states; no client inventory engine
- [x] Tests for empty/error
- [x] Playwright: open inventory list

**Done when:** Admin can see stock for seeded products; tests green.

---

## Phase 5: Orders

**OpenAPI capabilities:** order list/detail and allowed status transitions; payment reads optional.

**Scope:**

- [x] Orders table and detail
- [x] Transitions only via API operations allowed for the current order status (discover in OpenAPI; disable illegal controls in UX)
- [x] Disable illegal controls; still handle API rejection
- [x] Show payment fields when API returns them
- [x] Component tests for disabled vs enabled actions
- [x] Playwright: open order detail; one safe transition on seeded data if available

**Done when:** Admin can inspect an order and run at least one allowed transition in a test or seeded manual script checked into docs.

---

## Phase 6: Users

**OpenAPI capabilities:** user reads with optional role filter (writes optional in v1).

**Scope:**

- [x] User list/detail (role on read model + role filter)
- [x] No client-side IDOR bypass
- [x] Tests for empty/forbidden
- [x] Playwright: open users list

**Done when:** Admin can open seeded user detail read-only (or with documented mutations); tests green.

---

## Phase 7: Dashboard

**OpenAPI capabilities:** `/v1/admin/analytics/overview`, `payments/time-series`, `products/top`, `inventory/alerts` (plus recent orders list). See [API-INTEGRATION.md](API-INTEGRATION.md).

**Scope:**

- [x] Summary cards with documented data source (analytics overview)
- [x] Recharts visualizations (net revenue time series)
- [x] No invented SPA metrics; footnote documents UTC analytics aggregates (not Prometheus)
- [x] Tests for empty/error dashboard (+ permission gating)
- [x] Playwright: load dashboard after login (existing smoke heading)

**Done when:** Dashboard loads for seeded admin without inventing business metrics in the client.

---

## Phase 8: Quality sweep

> No new OpenAPI capabilities. Harden the SPA that Phases 2–7 already wired.

**OpenAPI capabilities:** none (uses existing operations).

### A. Operator journey (Playwright)

- [x] One spec: login → dashboard widgets visible → products list → open edit → orders list → open detail (same session)
- [x] Deduplicate overlapping smokes in `e2e/smoke.spec.ts`
- [x] Keep per-feature specs; journey is glue, not a replacement
- [x] In CI, missing `E2E_*` fails the e2e job; locally skip with the existing message

### B. Keyboard and accessibility

- [x] Skip link to `#main`; `main` id; `nav` `aria-label`
- [x] Page title is the `h1` (`PageHeader`); sidebar branding is not an `h1`
- [x] Sidebar keyboard + decorative icons `aria-hidden`
- [x] Mobile sheet: keyboard open, Esc closes, focus returns
- [x] Adjust-stock dialog: Tab / Esc / focus restore
- [x] `@axe-core/playwright` on login, dashboard, products, order detail (no serious/critical)
- [x] `eslint-plugin-jsx-a11y` + `eslint-plugin-react-hooks` (React 19 compatible)
- [x] Remove non-functional theme buttons
- [x] Loading / status: `role="status"`, `aria-busy`, `aria-live="polite"`
- [x] Focus `#main` (or page `h1`) after client navigation

### C. Consistency

- [x] Shared list query status UI + table pagination + `src/lib/format.ts` (operator locale)
- [x] TkDodo query-key factories; invalidate dashboard keys from mutations that affect widgets
- [x] Rename `useProductsQuery` → `useProductsListQuery`; `keepPreviousData` on products list
- [x] Domain API helpers through `throwApiErrorFromResponse` (products + order payments)
- [x] Dashboard recent-orders read through dashboard `api/`
- [x] Render `ErrorBoundary` around the shell outlet (no `QueryErrorResetBoundary` / `throwOnError`)
- [x] ProductsPage empty/error/retry tests; move page specs to `pages/__tests__/`
- [x] Align CONVENTIONS + ARCHITECTURE with real folders (`types.ts`, `pages/`, `lib/`, no barrels)

### D. CI and governance

- [x] PR merge gates (lint, typecheck, unit, build, audit) as parallel jobs plus a `ci` aggregator
- [x] Dependabot weekly npm + GitHub Actions updates (`.github/dependabot.yml`)
- [x] `e2e` job on `workflow_dispatch` and `push` to `main`/`master`; credentials required (no skip-to-green)
- [x] GOVERNANCE states when Playwright runs; PR e2e remains optional
- [x] PROJECT-CONTEXT + README current limits match shipped Phases 2–7

**Done when:** journey spec green locally against seeded API; axe/keyboard tests pass; lint includes hooks + jsx-a11y; query/API helper drift is gone; CI policy is documented and the e2e job does not skip-to-green.

---

Phases 9–11 are **this API version**, not new product ideas. Prefer API **Phase 14c** (OpenAPI truthfulness) before regenerating for Phase 9. Prefer API **Phase 14d** before Phase 11. Start each phase by regenerating the OpenAPI client and reading Swagger (or `schema.d.ts`) for the fields that exist **now**. Do not invent SPA filters or buttons for operations that are missing from Swagger. Do not keep an endpoint inventory in this file.

Phase 12 (payments) is optional and does **not** block Phase 13.

---

## Phase 9: Query parity

> No new OpenAPI operations. Put every **list query param this API already accepts** on the matching admin list (URL + visible controls). Table column-sort was deferred in filter comments; this phase owns it.

Named fields below were true at planning time. On start, take the **current** list query DTOs from live Swagger / `schema.d.ts`.

**OpenAPI capabilities:** existing product, order, and inventory list query DTOs (discover in OpenAPI).

**Scope:**

- [ ] **Products:** search box (name/SKU/description); `isActive`; `minPrice` / `maxPrice`; `categoryId` as a numeric filter until a categories list exists (do not invent a category picker)
- [ ] Pass those params through `listProductsRequest` (extend `ProductListFilters`)
- [ ] **Orders:** date range (`createdAfter` / `createdBefore`); `minAmount` / `maxAmount`; optional `firstName` / `lastName` if you keep `userName`
- [ ] Pass those params through `listOrdersRequest` (today the client drops them even if they were in the URL)
- [ ] **Inventory:** `productId` (e.g. from product/detail “view stock”)
- [ ] Column-sort UI bound to existing `sortBy` / `sortOrder` on products, orders, inventory (still URL-as-source-of-truth)
- [ ] Hide or relabel the Roles nav item until Phase 10 (stop advertising an empty page)
- [ ] Tests: each new control updates the URL and the query key; empty filter result still shows the empty table

**Done when:** an operator can exercise every documented list query field from the UI; no client-side filtering of full pages.

---

## Phase 10: Existing writes

> Wire **writes that already exist in OpenAPI**. Still no new API endpoints.

**OpenAPI capabilities:** product delete; user PATCH/activate/deactivate/delete; roles CRUD; permissions list (discover in OpenAPI).

**Scope:**

- [ ] Product: delete (confirm); keep 409 reload-and-retry on edit
- [ ] Users: activate / deactivate on detail (`manage_users`); optional PATCH of name/email/phone; do **not** fake role assignment
- [ ] User **address** writes only if OpenAPI still exposes them **and** ops need them
- [ ] Roles: replace the stub with list/create/edit/delete using `GET /v1/permissions` for the permission set; `manage_roles` only
- [ ] After role mutations, session chrome still comes from login/refresh `permissions` (ADR-0007): document that the operator may need to re-login or refresh to see nav changes for **their own** account
- [ ] Tests for forbidden vs allowed controls; Playwright: one delete or activate on seeded data if safe

**Done when:** superadmin can manage roles in the SPA; admin can deactivate a user and delete a product through the API; stub Roles page is gone.

---

## Phase 11: API gaps, then SPA

> Capabilities the domain already has but **HTTP does not**. Do this in `ecommerce-store-api` **Phase 14d** first, then regenerate the admin client.

**API (required before any SPA toggle):**

- [ ] Product activate / deactivate HTTP (same shape as users: dedicated activate/deactivate actions, `manage_products`): do not silently add `isActive` to PATCH if the domain treats it as a dedicated action
- [ ] Assign or replace a user’s role over HTTP (today `AssignRoleUseCase` is not on a controller)
- [ ] OpenAPI + tests in the API repo; regenerate `schema.d.ts` here

**Admin SPA (after the API ships):**

- [ ] Product status control on edit (and/or list row action)
- [ ] User detail: change assigned role
- [ ] Tests + Playwright

**Done when:** an operator can take a product off the catalog and change a user’s role without SQL or seed scripts.

---

## Phase 12: Payments ops (optional)

> The API already lists and mutates payments. v1 only showed payment **on order detail**. This is money movement: ship only if you want it in Control Center. **Does not block Phase 13.**

**OpenAPI capabilities:** payment list/detail and capture/refund/verify if present (discover in OpenAPI).

**Scope:**

- [ ] Payments list with the existing query DTO (`status`, `orderId`, `userId`, email/name, sort)
- [ ] Link from order detail to payment row
- [ ] Capture / refund / verify only with `view_all_payments` / whatever OpenAPI requires; disable illegal statuses; still handle API rejection
- [ ] Do not invent refund amounts the DTO does not allow

**Done when:** ops can find a payment without opening the order first; mutating actions are covered by tests.

---

## Phase 13: Release gate

> After Phases 9–11. Do **not** treat this as the next step after Phase 8. Optional Phase 12 may be skipped.

**Scope:**

- [ ] Hosted static deploy against a configured API
- [ ] README quick start on a clean machine
- [ ] Smoke checklist against seeded admin data
- [ ] README + PROJECT-CONTEXT still accurate
- [x] [`API-INTEGRATION.md`](API-INTEGRATION.md) local Swagger URL matches the API (`/api/docs`)

**Done when:** A stranger can follow the README and run a **full** operator loop (list filters, writes, roles, product status, role assign): not the thin Phase 8 surface.

---

## Out of scope (this API version)

- BFF
- Domain logic in the SPA
- Customer checkout UI, carts, register, inventory reserve/release/check (storefront)
- Inventing filters or buttons for operations that are not in OpenAPI
- Global client store for server data (use TanStack Query)
- Categories admin until the API exposes category list/write operations
