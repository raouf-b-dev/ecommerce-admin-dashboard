# E-commerce Admin Dashboard: Roadmap

> Delivery plan for the admin SPA. Work top to bottom.
>
> Companions: [README.md](../README.md), [API-INTEGRATION.md](API-INTEGRATION.md), [ecommerce-store-api](https://github.com/raouf-b-dev/ecommerce-store-api), [ecommerce-store-web](https://github.com/raouf-b-dev/ecommerce-store-web).

---

## How to use this file

- `[ ]` not started
- `[/]` in progress
- `[x]` done
- Finish each phase before starting the next.
- Keep domain rules and auth enforcement in the API.
- Contracts: live OpenAPI/Swagger + generated client. [API-INTEGRATION.md](API-INTEGRATION.md) is client rules only (not an endpoint list).

### Testing policy

Write tests **with** each feature.

| Layer | When |
| :---- | :--- |
| Unit / component | Same phase as the UI |
| Playwright | Extend smoke when the feature joins the critical path |
| Cross-cutting quality | Phase 8 only |

### Definition of done (every feature phase)

1. Wired to OpenAPI operations for that phase’s capabilities.
2. Listed tests green.
3. Lint + typecheck clean.
4. RBAC: UI may hide controls; API remains the authority.
5. Integration doc still accurate for that phase.

---

## Stack

| Concern | Choice |
| :------ | :----- |
| App | Vite + React 19 + TypeScript strict |
| Routing | React Router |
| Styling | Tailwind CSS + shadcn/ui |
| Client data | TanStack Query |
| Tables | TanStack Table |
| Local UI state | React state; Zustand when needed across trees |
| Forms | React Hook Form + Zod |
| Charts | Recharts (dashboard widgets) |
| API | Typed client from OpenAPI / Swagger |
| Tests | Vitest + Testing Library + Playwright |

**Ports (intent):** admin `3200`, API `3000`. Confirm in Phase 0.

---

## Phase overview

| Phase | Name | Status | Focus |
| ----- | ---- | ------ | ----- |
| **0** | Foundation | `[ ]` | Vite scaffold, tooling, tests, OpenAPI client |
| **1** | Agent ecosystem and conventions | `[ ]` | AGENT policy, context, AI docs, adapters |
| **2** | Auth and RBAC chrome | `[ ]` | Login, permission-aware nav + tests |
| **3** | Products | `[ ]` | Table/forms + tests |
| **4** | Inventory | `[ ]` | Stock views + tests |
| **5** | Orders | `[ ]` | Ops actions + tests |
| **6** | Customers | `[ ]` | Read views + tests |
| **7** | Dashboard | `[ ]` | Summary widgets + tests |
| **8** | Quality sweep | `[ ]` | Full smoke, a11y |
| **9** | Release gate | `[ ]` | Deploy, verified quick start |

---

## Phase 0: Foundation

> Runnable Vite app with toolchain and test harness.

**OpenAPI capabilities:** health / readiness (discover exact paths in Swagger).

**Scope:**

- [ ] Scaffold Vite React-TS
- [ ] Tailwind + shadcn/ui + app shell (sidebar/topbar)
- [ ] React Router skeleton
- [ ] `.env.example` with `VITE_API_BASE_URL=http://localhost:3000` (no secrets)
- [ ] `.gitignore` ignores `.env` and other secret files
- [ ] OpenAPI typed client stub + regenerate script
- [ ] Vitest + Testing Library sample test
- [ ] Playwright placeholder smoke
- [ ] Scripts: `dev`, `build`, `lint`, `typecheck`, `test`, `test:e2e`
- [ ] CI: lint, typecheck, unit tests
- [ ] Dev server on port **3200** (or document the chosen port)

**Done when:** clean install passes lint/typecheck/test; `npm run dev` shows the shell.

---

## Phase 1: Agent ecosystem and conventions

> Same idea as the API agent system, sized for a Vite SPA.

### Files to create (minimal outline)

| File | Purpose |
| :--- | :------ |
| `AGENT.md` | Authority order + non-negotiables |
| `.agents/PROJECT-CONTEXT.md` | Stack, folders, RBAC UX notes, API links |
| `docs/ai/README.md` | Index |
| `docs/ai/CONVENTIONS.md` | Feature folders, Query/Table/forms, 409 handling |
| `docs/ai/GOVERNANCE-AND-QUALITY-GATES.md` | Merge gates |
| `docs/ai/WORKFLOW-PLAYBOOK.md` | Task intake -> verify |
| `AGENTS.md` / `CLAUDE.md` / `.cursor/rules/*` | Thin adapters to `AGENT.md` |

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

- [ ] Create all files above
- [ ] Link from README docs table
- [ ] Adapters do not fork policy

**Done when:** `AGENT.md` + `PROJECT-CONTEXT.md` are enough to start a feature phase safely.

---

## Phase 2: Auth and RBAC chrome

**OpenAPI capabilities:** admin login/session; permission/role reads if needed for chrome.

**Seeded user:** administrator from API [`SEEDING.md`](https://github.com/raouf-b-dev/ecommerce-store-api/blob/master/docs/development/SEEDING.md) (do not paste passwords into this repo)

**Scope:**

- [ ] Login (RHF + Zod)
- [ ] Session persistence matching the API
- [ ] Protected route wrapper
- [ ] Nav filtered by permission claims (UX only)
- [ ] 401 -> login; 403 -> forbidden
- [ ] Component tests: validation, guard, forbidden
- [ ] Playwright: login success and failure

**Done when:** Seeded admin reaches the shell; forbidden route shows 403 UX; tests green.

---

## Phase 3: Products

**OpenAPI capabilities:** product list/detail and product writes.

**Scope:**

- [ ] Product table (TanStack Table)
- [ ] Create/edit forms aligned to API DTOs
- [ ] Query invalidation after mutations
- [ ] HTTP 409 OCC: reload and retry
- [ ] Component tests for validation and 409 messaging
- [ ] Playwright: list + open create/edit

**Done when:** Admin can create/edit a product via API; 409 path is covered by a test or documented manual check with follow-up issue.

---

## Phase 4: Inventory

**OpenAPI capabilities:** inventory reads (and adjust/low-stock if you ship them in v1).

**Scope:**

- [ ] Stock list/detail from API read models
- [ ] Low-stock view if useful
- [ ] Adjust stock only if product needs it in v1
- [ ] Empty/error states; no client inventory engine
- [ ] Tests for empty/error
- [ ] Playwright: open inventory list

**Done when:** Admin can see stock for seeded products; tests green.

---

## Phase 5: Orders

**OpenAPI capabilities:** order list/detail and allowed status transitions; payment reads optional.

**Scope:**

- [ ] Orders table and detail
- [ ] Transitions only via API operations allowed for the current order status (discover in OpenAPI; disable illegal controls in UX)
- [ ] Disable illegal controls; still handle API rejection
- [ ] Show payment fields when API returns them
- [ ] Component tests for disabled vs enabled actions
- [ ] Playwright: open order detail; one safe transition on seeded data if available

**Done when:** Admin can inspect an order and run at least one allowed transition in a test or seeded manual script checked into docs.

---

## Phase 6: Customers

**OpenAPI capabilities:** customer/user reads (writes optional in v1).

**Scope:**

- [ ] Customer list/detail
- [ ] No client-side IDOR bypass
- [ ] Tests for empty/forbidden
- [ ] Playwright: open customers list

**Done when:** Admin can open seeded customer detail read-only (or with documented mutations); tests green.

---

## Phase 7: Dashboard

**OpenAPI capabilities:** dashboard inputs from existing reads or future API aggregates (no invented metrics).

**Scope:**

- [ ] Summary cards with documented data source
- [ ] Recharts visualizations
- [ ] If totals are approximate due to pagination, say so in the UI or docs
- [ ] Tests for empty/error dashboard
- [ ] Playwright: load dashboard after login

**Done when:** Dashboard loads for seeded admin without inventing business metrics in the client.

---

## Phase 8: Quality sweep

- [ ] Playwright journey: login -> products -> order detail
- [ ] Keyboard access for sidebar and dialogs
- [ ] CI unit + e2e (or documented e2e job) reliable

**Done when:** Journey green in CI or linked scheduled job.

---

## Phase 9: Release gate

- [ ] Hosted static deploy against a configured API
- [ ] README quick start on a clean machine
- [ ] Smoke checklist against seeded admin data
- [ ] README + PROJECT-CONTEXT still accurate

**Done when:** A stranger can follow the README and perform a basic admin flow.

---

## Out of scope (v1)

- BFF
- Domain logic in the SPA
- Customer checkout UI
- Payment ops beyond API capabilities
- Global client store for server data (use TanStack Query)
