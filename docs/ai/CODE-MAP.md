# Code Map

Where things live in `ecommerce-admin-dashboard`. Paths are relative to the repository root.

## Role

Operator-facing SPA for `ecommerce-store-api`. It consumes the versioned HTTP contract, owns no domain rules, and may hide or disable actions for UX while the API stays the authority for authorization and data integrity. Only sessions with `access_admin` are admitted ([ADR-0006](../architecture/adr/ADR-0006-operators-only-admin-spa.md)). A domain `401` triggers one silent refresh ([ADR-0005](../architecture/adr/ADR-0005-silent-one-shot-access-token-refresh.md)).

## Source

- `src/main.tsx`: entry; mock gate (CONVENTIONS section 15).
- `src/app/`: `router.tsx` (data router, lazy pages), `navigation.ts` (nav items with `permission`), `pages/` (404, root error).
- `src/components/layout/`: shell (sidebar, header, mobile nav, page header).
- `src/components/theme/`: theme provider, toggle, toaster.
- `src/components/feedback/`: `QueryLoading`, `QueryStateAlert`, `ActionErrorAlert`, `TableEmptyState`.
- `src/components/ui/`: shadcn-style primitives.
- `src/components/media/`: product thumbnail and name cell.
- `src/features/<name>/`: `auth`, `dashboard`, `inventory`, `orders`, `products`, `roles`, `users`. Inside: `api/`, `hooks/`, `components/`, `pages/`, `lib/`, `schemas/`, `types.ts` (CONVENTIONS section 2).
- `src/lib/api/`: `client.ts` (generated `openapi-fetch` client with refresh and retry), `generated/schema.d.ts` types, `parse-api-error.ts`, `throw-api-error.ts`, `form-api-errors.ts`, `silent-refresh.ts`.
- `src/lib/auth/`: `AuthProvider`, session HTTP, route guards, permission helpers, forbidden and operator-denied pages.
- `src/lib/query-keys/`: order, inventory, and dashboard key factories shared with the WebSocket provider.
- `src/lib/ws/`: Socket.IO connection, notification envelope, Query invalidation.
- `src/lib/mock/`: MSW handlers, seed data, demo UI (`npm run dev:mock`).
- `src/lib/format.ts`, `list-filters.ts`, `url.ts`, `status.ts`: shared helpers.
- `src/test/`: Vitest setup and `create-test-jwt.ts`.
- `e2e/`: Playwright projects (guest, admin, mobile-pixel, mobile-iphone, superadmin); see `e2e/README.md`.
- `scripts/`: `generate-api-client.js`, `generate-env.js`, `ascii-prose.cjs`, `lint-ascii-prose.cjs`, asset capture.

## Local environment

- Dev and preview both bind `http://localhost:5174` (`strictPort`); stop one before starting the other.
- API origin is `VITE_API_BASE_URL` (default `http://localhost:3000`). The API must allow `http://localhost:5174` with `credentials: true`.
- `npm run dev:mock` runs without a backend (MSW, demo login). Playwright needs a real seeded API; `e2e/global-setup.ts` seeds the sibling `../ecommerce-store-api` unless `E2E_SKIP_DB_SEED=1`. Boot, Docker, and credentials: the API repo's `README.md`, `docs/development/LOCAL-SETUP.md`, and `docs/development/SEEDING.md`.
- Seeded operators start with `mustChangePassword: true`; first login lands on `/change-password`.
- Browser configuration uses `VITE_*` public values only. Create local files with `npm run env:init` (never commit `.secrets`).

## API integration

OpenAPI is the contract; use the generated client and a thin wrapper in each feature's `api/`. If Swagger and runtime disagree, fix the API. Client rules: [API-INTEGRATION.md](../API-INTEGRATION.md).
