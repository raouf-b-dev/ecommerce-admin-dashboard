# Project Context Accelerator

Read this file first for fast orientation. It summarizes `ecommerce-admin-dashboard` without replacing the canonical docs.

## Tech Stack

- Framework: Vite + React 19
- Language: TypeScript (strict)
- Routing: React Router data router (`createBrowserRouter`)
- Styling: Tailwind CSS + shadcn-style tokens
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

## Local Environment

- Admin dev server intent: `http://localhost:5174`
- API origin intent: `http://localhost:3000` (or the `PORT` configured in the API env)
- Cross-origin local development assumes the API allows `http://localhost:5174` with `credentials: true`.
- Browser configuration must use `VITE_*` env vars only. Do not expose secrets.

## Directory Map

- `src/app/` -> route configuration (`router.tsx`), nav config (`navigation.ts`), app-level pages
- `src/components/layout/` -> shared shell (sidebar, header, mobile nav, page header)
- `src/components/ui/` -> shadcn-style UI primitives
- `src/features/` -> feature folders (`dashboard`, `products`, `orders`, `auth`, etc.)
- `src/features/<name>/pages/` -> route entry components per feature
- `src/lib/auth/` -> route guards (`ProtectedRoute`, `GuestRoute`)
- `src/lib/api/` -> generated schema and typed client wrapper
- `src/test/` -> shared test setup
- `e2e/` -> Playwright smoke and later end-to-end flows
- `docs/` -> roadmap, API integration notes, AI conventions

## Upcoming Feature Order

1. Auth and RBAC chrome (wire guards to API session)
2. Products
3. Inventory
4. Orders
5. Customers
6. Dashboard

Use [`docs/ROADMAP.md`](../docs/ROADMAP.md) for delivery plan and done criteria.

## API Integration Rules

- Contract source of truth: API OpenAPI / Swagger
- Default integration path: generated client + thin local wrapper
- If Swagger and runtime behavior disagree, verify the API and fix the issue at the source
- Do not maintain a second endpoint inventory in this repo
