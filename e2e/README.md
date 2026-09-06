# End-to-end tests

Playwright runs against the Vite dev server (`http://localhost:5174`) and a live [ecommerce-store-api](https://github.com/raouf-b-dev/ecommerce-store-api) instance.

## Specs

| Spec | Role |
| :--- | :--- |
| `critical-path.spec.ts` | Same-session journey: login → dashboard widgets → products → edit → orders → detail |
| `a11y.spec.ts` | axe-core (serious/critical) on login, dashboard, products, order detail |
| `keyboard.spec.ts` | Skip link, sidebar Enter, mobile sheet Esc, adjust-stock Esc |
| `smoke.spec.ts` | Unauthenticated login page, failed login, login success, mobile nav, forbidden route |
| Per-feature specs | Products, inventory, orders, users, operator gate, change-password |

The journey is glue, not a replacement for per-feature specs.

## Prerequisites

1. A running [ecommerce-store-api](https://github.com/raouf-b-dev/ecommerce-store-api) instance. Follow that repository’s [README](https://github.com/raouf-b-dev/ecommerce-store-api#quick-start) or [local setup](https://github.com/raouf-b-dev/ecommerce-store-api/blob/master/docs/development/LOCAL-SETUP.md).
2. Seeded administrator account (credentials stay in API [SEEDING.md](https://github.com/raouf-b-dev/ecommerce-store-api/blob/master/docs/development/SEEDING.md) only).
3. `VITE_API_BASE_URL` pointing at the API origin (this repo defaults to `http://localhost:3000`; match the API `PORT` if you remapped it).
4. **Sibling checkout:** [`global-setup.ts`](./global-setup.ts) runs `npm run db:seed:auth` in `../ecommerce-store-api`. That script name is this repo’s integration contract - if the API renames it, update `global-setup.ts`. Clone the API next to this repo, or set `E2E_SKIP_DB_SEED=1` and seed the API yourself (setup fails if the sibling path is missing and the skip flag is unset).

Live operator checklist (when to run e2e vs manual Process/Ship): [`docs/RELEASE-GATE.md`](../docs/RELEASE-GATE.md).

## Authenticated tests

Playwright runs [`global-setup.ts`](./global-setup.ts) before the suite, which executes `npm run db:seed:auth` in the sibling API repo. What that script resets (passwords vs catalog) is documented in the API [seeding guide](https://github.com/raouf-b-dev/ecommerce-store-api/blob/master/docs/development/SEEDING.md). Set `E2E_SKIP_DB_SEED=1` to skip when you have already seeded manually or the API is hosted elsewhere.

Auth-only seed does **not** restore products or the confirmed demo order. Run `npm run test:e2e` **before** a manual Process/Ship walk. If that order was already mutated, restore catalog and orders from the API seeding guide first.

The API rate-limits login and register. A browser smoke plus an immediate `npm run test:e2e` can 429 - wait about a minute, or run e2e first. Current limits: API docs.

Tests that sign in require environment variables (never commit passwords):

```bash
export E2E_ADMIN_EMAIL=admin@store.local
export E2E_ADMIN_PASSWORD=...   # from API SEEDING.md
npm run test:e2e
```

On Windows PowerShell:

```powershell
$env:E2E_ADMIN_EMAIL="admin@store.local"
$env:E2E_ADMIN_PASSWORD="..."
$env:VITE_API_BASE_URL="http://localhost:3000"
npm run test:e2e
```

**Locally**, authenticated specs `test.skip` when `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` are unset.

**In CI**, missing those variables fails the job (`playwright.config.ts` throws when `CI` is set). There is no skip-to-green.

### Forced password change spec

`e2e/change-password.spec.ts` uses **superadmin** so smoke tests can keep using **admin** via `loginAsAdmin`:

```powershell
$env:E2E_SUPERADMIN_PASSWORD="..."   # from API SEEDING.md
$env:E2E_SUPERADMIN_NEW_PASSWORD="..."   # optional; helpers append a default suffix if unset
```

After a rotation test, the next `npm run test:e2e` re-seeds auth via global setup. For a full catalog and order reset, use the API seeding guide.

Products, inventory, and orders list smokes assume catalog + inventory + demo orders already exist (full seed in the API repo). Auth-only seed does not re-insert products, stock, or orders.

### Customer blocked from admin

`e2e/operator-gate.spec.ts` verifies seeded **customer** accounts cannot enter Control Center:

```powershell
$env:E2E_CUSTOMER_EMAIL="customer@store.local"
$env:E2E_CUSTOMER_PASSWORD="..."   # from API SEEDING.md
```

Unauthenticated redirect and login-failure tests do not require credentials.

## CI

The `e2e` GitHub Actions job runs on `workflow_dispatch` and on push to `main`/`master`. Pull requests run the parallel merge gates (lint, typecheck, unit, build, audit) aggregated as `ci`. Playwright is optional on PRs because the suite needs a seeded API, `workers: 1`, and a rate-limited login.

Repository secrets (see [`.secrets.example`](../.secrets.example); generate a local `.secrets` with `npm run env:init:secrets`, then fill passwords from API `SEEDING.md`):

- `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD` (required: job fails if unset)
- `E2E_CUSTOMER_EMAIL`, `E2E_CUSTOMER_PASSWORD`, `E2E_SUPERADMIN_EMAIL`, `E2E_SUPERADMIN_PASSWORD` (operator-gate and change-password specs)

Do not commit `.secrets`.

## Parallelism

Playwright runs with `workers: 1` and `fullyParallel: false`. Authenticated specs share one seeded admin account; parallel workers raced forced password rotation and the API login throttle. Prefer a single worker unless you introduce isolated e2e users.

The API rate-limits login and register (see the API repo for the current window). Rapid local re-runs can still 429; prefer `workers: 1` and avoid re-logging in every spec when possible. The login form shows a distinct throttle message (not “invalid password”). Playwright’s default timeout is **180s** so helpers can wait out a 429.
