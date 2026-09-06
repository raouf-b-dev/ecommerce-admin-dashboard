# End-to-end tests

Playwright runs against the Vite dev server (`http://localhost:5174`) and a live [ecommerce-store-api](https://github.com/raouf-b-dev/ecommerce-store-api) instance.

## Specs

| Spec | Role |
| :--- | :--- |
| `critical-path.spec.ts` | Same-session journey: dashboard widgets → products → edit → orders → detail |
| `a11y.spec.ts` / `a11y-shell.spec.ts` | axe-core (serious/critical) on login, then dashboard, products, order detail |
| `keyboard.spec.ts` | Skip link, sidebar Enter, mobile sheet Esc, adjust-stock Esc |
| `smoke.spec.ts` / `shell.spec.ts` | Unauthenticated login page, failed login, signed-in shell, mobile nav, forbidden route |
| Per-feature specs | Products, inventory, orders, users, roles, operator gate, change-password |

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

**Locally**, the admin worker `test.skip`s when `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` are unset. Customer and superadmin specs skip when their variables are unset.

**In CI**, missing admin, customer, or superadmin variables fails the job (`playwright.config.ts` throws when `CI` is set). Process/Ship fail if the seeded orders are missing. There is no skip-to-green for those.

### Forced password change spec

`e2e/change-password.spec.ts` uses **superadmin** so the admin worker session can keep using **admin**:

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

Unauthenticated redirect and login-failure tests do not require credentials. The admin **login form** is exercised by the worker fixture (`signInAsAdmin`); `shell.spec.ts` asserts the signed-in dashboard, not the form.

## CI

The `e2e` GitHub Actions job runs on PRs into `main`/`master` and on `workflow_dispatch`. Push to those branches skips it (the merge PR already ran it). Feature PRs into other branches skip it. The `ci` aggregator waits on Playwright: skipped is a pass; failure or cancelled is a fail. On `main`/`master` PRs, Playwright must succeed.

Repository secrets (see [`.secrets.example`](../.secrets.example); generate a local `.secrets` with `npm run env:init:secrets`, then fill passwords from API `SEEDING.md`):

- `E2E_ADMIN_EMAIL`, `E2E_ADMIN_PASSWORD` (required)
- `E2E_CUSTOMER_EMAIL`, `E2E_CUSTOMER_PASSWORD` (required: operator-gate)
- `E2E_SUPERADMIN_PASSWORD` (required: roles, change-password). `E2E_SUPERADMIN_EMAIL` is optional and defaults to `superadmin@store.local`.

Do not commit `.secrets`.

## Parallelism

Two workers, three projects:

| Project | Workers | Specs |
| :--- | :--- | :--- |
| `guest` | remaining pool | Login page, failed login, customer operator-gate |
| `admin` | 1 | Shell, products, inventory, orders, users, keyboard, journey, signed-in a11y |
| `superadmin` | 1 | Roles, forced password change |

Admin specs sign in **once per worker** (`e2e/helpers/admin-fixtures.ts`) and **reuse that page**. A new page per test would bootstrap via silent refresh; React Strict Mode can fire two refreshes at once, which rotates the cookie and can revoke the session, and many reloads hit the API refresh throttle. A Playwright `storageState` file would freeze the first cookie and collide with reuse detection.

Do not raise the admin project above 1 worker without **distinct seeded admins**. Two workers logging in as the same operator invalidate each other’s refresh tokens. Mutating tests (process/ship, deactivate user, adjust stock) also share catalog data.

Guest and superadmin may run beside the admin worker because they use other accounts (or no account). Login and register are still rate-limited per IP (~10/min). The remaining guest/superadmin logins plus one admin login stay under that. Rapid local re-runs can still 429; the login form shows a distinct throttle message (not “invalid password”). Playwright’s default timeout is **180s** so helpers can wait out a 429.
