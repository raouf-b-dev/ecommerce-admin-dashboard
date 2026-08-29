# End-to-end tests

Playwright smoke tests run against the Vite dev server (`http://localhost:5174`) and a live [ecommerce-store-api](https://github.com/raouf-b-dev/ecommerce-store-api) instance.

## Prerequisites

1. API running locally (see API `docs/development/LOCAL-SETUP.md`).
2. Seeded administrator account (see API `docs/development/SEEDING.md` — credentials stay in that doc only).
3. `VITE_API_BASE_URL` pointing at the API origin (for example `http://localhost:4000` when the API uses a remapped port).

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
$env:VITE_API_BASE_URL="http://localhost:4000"
npm run test:e2e
```

### Forced password change spec

`e2e/change-password.spec.ts` uses **superadmin** so smoke tests can keep using **admin** via `loginAsAdmin`:

```powershell
$env:E2E_SUPERADMIN_PASSWORD="SuperAdmin123!"   # from API SEEDING.md
$env:E2E_SUPERADMIN_NEW_PASSWORD="SuperAdminRotated1!"   # optional; default suffix Rotated1!
```

After a rotation test, the next `npm run test:e2e` re-seeds auth via global setup. For a full database reset, run `npm run db:seed` in the API repo.

Unauthenticated redirect and login-failure tests do not require credentials.
