# Project Context Accelerator

Read this file first for fast orientation. It summarizes `ecommerce-admin-dashboard` without replacing the canonical docs.

## Tech Stack

- Framework: Vite + React 19
- Language: TypeScript (strict)
- Routing: React Router data router (`createBrowserRouter`)
- Styling: Tailwind CSS + shadcn-style tokens + accessible Dark/Light/System theme provider
- Real-time: Socket.IO client (`src/lib/ws/`) + Sonner toasts
- Client data: TanStack Query
- Tables: TanStack Table
- Forms: React Hook Form + Zod
- API integration: `openapi-fetch` client + generated OpenAPI types
- Testing: Vitest, Testing Library, Playwright

## System Role

This repository is the operator-facing SPA for `ecommerce-store-api`.

- It consumes the API contract over versioned HTTP.
- It does not own domain rules.
- It may hide or disable actions for UX, but the API remains the authority for auth and data integrity.
- Only sessions with `access_admin` are admitted ([ADR-0006](../docs/architecture/adr/ADR-0006-operators-only-admin-spa.md)).
- Domain `401` recovery: one-shot silent refresh ([ADR-0005](../docs/architecture/adr/ADR-0005-silent-one-shot-access-token-refresh.md)).

## Local Environment

- Admin dev server intent: `http://localhost:5174`
- API origin: `VITE_API_BASE_URL` (this repo’s default is `http://localhost:3000`; match the API `PORT` if remapped)
- Live API boot, Docker, and seed credentials: API [README](https://github.com/raouf-b-dev/ecommerce-store-api#quick-start), [LOCAL-SETUP.md](https://github.com/raouf-b-dev/ecommerce-store-api/blob/master/docs/development/LOCAL-SETUP.md), and [SEEDING.md](https://github.com/raouf-b-dev/ecommerce-store-api/blob/master/docs/development/SEEDING.md)
- Seeded operator accounts start with `mustChangePassword: true`. First login lands on `/change-password` before the shell.
- Cross-origin local development assumes the API allows `http://localhost:5174` with `credentials: true`.
- `npm run dev` and `npm run preview` both bind **5174** (`strictPort`). Stop one before starting the other.
- Browser configuration must use `VITE_*` env vars only. Do not expose secrets.
- Playwright `e2e/global-setup.ts` runs `npm run db:seed:auth` in sibling `../ecommerce-store-api`. Set `E2E_SKIP_DB_SEED=1` if that checkout is missing or the API is already seeded. Login is rate-limited; admin specs share one worker-scoped session (see [`e2e/README.md`](../e2e/README.md)).

## Directory Map

- `src/app/` -> route configuration (`router.tsx`), nav config (`navigation.ts`), app-level pages
- `src/components/layout/` -> shared shell (sidebar, header, mobile nav, page header)
- `src/components/theme/` -> theme provider, toggle, and OS media query sync (`useSyncExternalStore`)
- `src/components/ui/` -> shadcn-style UI primitives
- `src/features/` -> feature folders (`dashboard`, `products`, `orders`, `auth`, etc.)
- `src/features/<name>/pages/` -> route entry components per feature
- `src/features/<name>/hooks/` -> TanStack Query (auth has none; session is in `lib/auth`)
- `src/lib/auth/` -> `AuthProvider`, route guards (`IndexLandingGate`, safe landing), permission helpers
- `src/lib/ws/` -> WebSocket gateway connection (`socket.io-client`), notification envelope, TanStack Query invalidation
- `src/lib/format.ts` -> shared money/date formatting
- `docs/architecture/` -> SPA architecture overview and ADRs
- `src/lib/api/` -> generated schema and typed client wrapper
- `src/test/` -> shared test setup
- `e2e/` -> Playwright (guest, admin, and superadmin projects)
- `docs/` -> roadmap, API integration notes, AI conventions

## Upcoming Feature Order

1. ~~Auth and RBAC chrome (wire guards to API session)~~ **done**
2. ~~Operator gate + silent refresh~~ **done**
3. ~~Products~~ **done**
4. ~~Inventory~~ **done**
5. ~~Orders~~ **done**
6. ~~Users~~ **done**
7. ~~Dashboard~~ **done**
8. ~~Quality sweep (journey, a11y, consistency, CI e2e policy)~~ **done**
8a. ~~Standalone zero-backend preview (MSW `dev:mock`)~~ **done** (demo-only; Playwright still needs a real API)
9. ~~Query parity (list filters/sort this API already accepts)~~ **done**
10. ~~Existing writes (product delete, user activate, roles UI)~~ **done**
11. ~~API gaps then SPA (product activate, assign role)~~ **done**
12. ~~User address book (list on user detail + existing writes)~~ **done**
12.5. ~~Operational UX, real-time & hardening (Theme provider, WebSocket feed, silent refresh session sync, safe landing, RFC 9110 error helpers)~~ **done (core slice)**
13. ~~Release gate (live API stranger quick start + operator smoke)~~ **done** - see [`docs/RELEASE-GATE.md`](../docs/RELEASE-GATE.md)
13.5. ~~Visual showcase (hero WebP walkthrough, 3 retina stills, README hero & matrix, UI/UX polish)~~ **done**
12. Payments ops (optional; does not block the release gate)

Backend delivery detail: API [`ROADMAP.md`](https://github.com/raouf-b-dev/ecommerce-store-api/blob/master/docs/ROADMAP.md).

Use [`docs/ROADMAP.md`](../docs/ROADMAP.md) for this repo’s delivery plan and done criteria.

Mock mode boundaries (who may import `@/lib/mock`, Playwright vs MSW): [`docs/ai/CONVENTIONS.md`](../docs/ai/CONVENTIONS.md) §15.

## API Integration Rules

- Contract source of truth: API OpenAPI / Swagger
- Default integration path: generated client + thin local wrapper
- If Swagger and runtime behavior disagree, verify the API and fix the issue at the source
- Do not maintain a second endpoint inventory in this repo
