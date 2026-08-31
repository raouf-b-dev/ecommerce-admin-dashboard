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

1. API running locally (see API `docs/development/LOCAL-SETUP.md`).
2. Seeded administrator account (see API `docs/development/SEEDING.md`: credentials stay in that doc only).
3. `VITE_API_BASE_URL` pointing at the API origin (default `http://localhost:3000`; match the API `PORT` if you remapped it).

## Authenticated tests

Playwright runs [`global-setup.ts`](./global-setup.ts) before the suite, which executes `npm run db:seed:auth` in the API repo. That resets demo passwords and `mustChangePassword: true` for seeded accounts without re-inserting catalog data. Set `E2E_SKIP_DB_SEED=1` to skip when you have already seeded manually.

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
$env:E2E_SUPERADMIN_PASSWORD="SuperAdmin123!"   # from API SEEDING.md
$env:E2E_SUPERADMIN_NEW_PASSWORD="SuperAdminRotated1!"   # optional; default suffix Rotated1!
```

After a rotation test, the next `npm run test:e2e` re-seeds auth via global setup. For a full database reset, run `npm run db:seed` in the API repo.

Products, inventory, and orders list smokes assume catalog + inventory + demo orders seed data already exist (`npm run db:seed` in the API). Auth-only seed does not re-insert products, stock, or orders.

### Customer blocked from admin

`e2e/operator-gate.spec.ts` verifies seeded **customer** accounts cannot enter Control Center:

```powershell
$env:E2E_CUSTOMER_EMAIL="customer@store.local"
$env:E2E_CUSTOMER_PASSWORD="..."   # from API SEEDING.md
```

Unauthenticated redirect and login-failure tests do not require credentials.

## CI

The `e2e` GitHub Actions job runs on `workflow_dispatch` and on push to `main`/`master`. Pull requests run the parallel merge gates (lint, typecheck, unit, build, audit) aggregated as `ci`. Playwright is optional on PRs because the suite needs a seeded API, `workers: 1`, and a 10/min login throttle.

Repository secrets (see [`.secrets.example`](../.secrets.example); generate local copy with `npm run env:init:secrets`):

- `E2E_ADMIN_EMAIL` and `E2E_ADMIN_PASSWORD` (required: job fails if unset)
- `E2E_CUSTOMER_EMAIL`, `E2E_CUSTOMER_PASSWORD`, `E2E_SUPERADMIN_EMAIL`, `E2E_SUPERADMIN_PASSWORD` (operator-gate and change-password specs)

Use the same emails and passwords as API `SEEDING.md`. Do not put those values in this repository.

## Parallelism

Playwright runs with `workers: 1` and `fullyParallel: false`. Authenticated specs share one seeded admin account; parallel workers raced forced password rotation and the API login throttle. Prefer a single worker unless you introduce isolated e2e users.

Auth login/register throttle is **10/min** (`AUTH_STRICT_LIMIT` in the API). Rapid local re-runs can still 429 until the prior 60s window expires; prefer `workers: 1` and avoid re-logging in every spec when possible.
