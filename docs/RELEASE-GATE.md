# Operator smoke and live verification

Walk this list against a **live** API. Mock mode (`npm run dev:mock`) is a demo only and does not satisfy this checklist.

Credentials stay in the API [seeding guide](https://github.com/raouf-b-dev/ecommerce-store-api/blob/master/docs/development/SEEDING.md). Do not paste passwords into this repository.

## Before you start

1. `ecommerce-store-api` is running. Follow that repository’s [README](https://github.com/raouf-b-dev/ecommerce-store-api#quick-start) or [local setup](https://github.com/raouf-b-dev/ecommerce-store-api/blob/master/docs/development/LOCAL-SETUP.md) (Docker and seed steps live there).
2. This dashboard is configured (`npm run env:init`) and served with `npm run dev` on port **5174**. Point `VITE_API_BASE_URL` at the API origin from step 1 (this repo defaults to `http://localhost:3000`).
3. If you will run Playwright, check out `ecommerce-store-api` as a **sibling directory** (`../ecommerce-store-api`) so `e2e/global-setup.ts` can reset demo auth. Otherwise set `E2E_SKIP_DB_SEED=1` and seed the API yourself. See [`e2e/README.md`](../e2e/README.md).

The API rate-limits login and register. Run automated e2e **before** a long manual login walk, or wait about a minute after browser sign-ins before `npm run test:e2e`. Current limits: API docs.

There is only one seeded **confirmed** demo order. Playwright’s orders spec needs it. Run `npm run test:e2e` **before** you Process or Ship that order by hand. If you already mutated it, restore catalog and orders using the API [seeding guide](https://github.com/raouf-b-dev/ecommerce-store-api/blob/master/docs/development/SEEDING.md) before e2e.

## Stranger boot

- [ ] The API is healthy at the origin in `VITE_API_BASE_URL` (health and Swagger URLs: API README / local setup).
- [ ] Admin `npm run env:init` then `npm run dev` opens `http://localhost:5174`.
- [ ] Sign in as the seeded **administrator**. The first login must land on **Change your password**. After a successful change, the shell (Log out control) appears.
- [ ] After login, the browser opens a Socket.IO connection to the API origin without console errors. A live `order.created` toast is not required (that needs another client).

## Operator loop (administrator)

Use the seeded **administrator** unless a row says otherwise.

- [ ] **Products — search:** Apply a search; the URL includes the `search` query param and the table updates.
- [ ] **Products — status:** Set Status to Active or Inactive; the URL includes `isActive`.
- [ ] **Products — edit:** Open an existing product. Name and price are populated.
- [ ] **Products — catalog status:** Deactivate then activate (or the reverse) from product edit. Confirm dialogs complete without a client-side error.
- [ ] **Inventory — adjust:** Open a high-stock row, **Adjust stock**, ADD 1, apply. Available quantity increases by 1. SUBTRACT 1 to restore the seed value.
- [ ] **Inventory — conflict banner:** Open the adjust dialog and confirm the conflict alert slot exists. A live HTTP 409 needs two concurrent writes; unit tests cover `isOptimisticLockConflict`. Do not invent a client `version` field.
- [ ] **Orders — process then ship:** Filter to **confirmed**, open the demo order, **Process**, then **Ship**. Confirm on the pending-payment order needs a completed payment (not in this loop). Do not add a payments capture step here.
- [ ] **Users — status:** Open `customer@store.local`, deactivate, then reactivate so the account stays usable.
- [ ] **Users — addresses:** Add an address, **Set default**, then delete the address you added (leave the seeded home address).
- [ ] **Roles — hidden for administrator:** User detail must **not** show Change role / Assigned role. The seeded administrator does not have `manage_roles`.

## Operator loop (super administrator)

- [ ] Sign in as the seeded **super administrator** (forced password change on first login, same as administrator).
- [ ] Open a user detail page and change the assigned role, then change it back if you want the seed role restored.

## Live static packaging

`npm run dev` and `npm run preview` both bind port **5174** with `strictPort`. Stop the dev server first.

```bash
VITE_API_BASE_URL="http://localhost:3000" npm run build
npm run preview
```

```powershell
$env:VITE_API_BASE_URL="http://localhost:3000"
npm run build
npm run preview
```

- [ ] Preview opens `http://localhost:5174`.
- [ ] Sign in (or complete password change if the seed flag is still set), reach the shell, and load one list page (products or orders) against the live API.

`npm run build:mock` and `vercel.json` package the **mock** SPA. They do not prove a live API origin.

## Automated evidence

From this repo, with the API running and `E2E_*` filled (`npm run env:init:secrets`, then passwords from the API seeding guide):

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e
```

If e2e must run again after you Process/Ship the confirmed order, restore catalog and orders using the API [seeding guide](https://github.com/raouf-b-dev/ecommerce-store-api/blob/master/docs/development/SEEDING.md) first.
