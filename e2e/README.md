# End-to-end tests

Playwright smoke tests run against the Vite dev server (`http://localhost:5174`) and a live [ecommerce-store-api](https://github.com/raouf-b-dev/ecommerce-store-api) instance.

## Prerequisites

1. API running locally (see API `docs/development/LOCAL-SETUP.md`).
2. Seeded administrator account (see API `docs/development/SEEDING.md` — credentials stay in that doc only).
3. `VITE_API_BASE_URL` pointing at the API origin (for example `http://localhost:4000` when the API uses a remapped port).

## Authenticated tests

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

Unauthenticated redirect and login-failure tests do not require credentials.
