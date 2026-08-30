# E-commerce Admin Dashboard

<p align="center">
  <a href="https://github.com/raouf-b-dev/ecommerce-admin-dashboard/actions"><img src="https://github.com/raouf-b-dev/ecommerce-admin-dashboard/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black" alt="React"></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white" alt="Vite"></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"></a>
  <a href="https://tanstack.com/query"><img src="https://img.shields.io/badge/TanStack-Query-FF4154?style=flat&logo=react-query&logoColor=white" alt="TanStack Query"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License"></a>
</p>

> Admin SPA for the [E-commerce Store API](https://github.com/raouf-b-dev/ecommerce-store-api). Built with React and Vite. Business rules stay in the API.

## Table of Contents

- [What this is](#what-this-is)
- [Quick start](#quick-start)
- [Verify](#verify)
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Documentation](#documentation)
- [Related repositories](#related-repositories)
- [Project layout](#project-layout)
- [License](#license)

---

<a id="what-this-is"></a>

## What this is

Vite + React app for store operators. Login, session handling, and permission-aware navigation are in place. Product, inventory, order, user, and dashboard screens are wired to the API.

The UI can hide nav items or show a forbidden page when a permission is missing. That is convenience only; the API still checks every request. There is no BFF: the browser calls the API with a typed OpenAPI client.

The same backend also powers the [customer storefront](https://github.com/raouf-b-dev/ecommerce-store-web).

**Current limits**

| Topic | Status |
| :---- | :----- |
| Feature screens | Auth, products, inventory, orders, users, and dashboard are wired to OpenAPI. |
| Dashboard | Operational cockpit (analytics overview, revenue series, alerts, recent orders). |
| Hosted demo | Local dev only (release-gate work). |
| Roles admin | Settings stub; role writes are not a product surface yet. |

---

<a id="quick-start"></a>

## Quick start

### Prerequisites

- **Node.js** >= 24
- **npm** >= 11
- A running [ecommerce-store-api](https://github.com/raouf-b-dev/ecommerce-store-api)

### Run the API first

Use the API repo for Docker, migrations, and seed accounts. Script names live there so they do not drift in two places.

[Local setup](https://github.com/raouf-b-dev/ecommerce-store-api/blob/master/docs/development/LOCAL-SETUP.md) · [Seeding](https://github.com/raouf-b-dev/ecommerce-store-api/blob/master/docs/development/SEEDING.md) (local fixtures only)

### Run this app

```bash
git clone https://github.com/raouf-b-dev/ecommerce-admin-dashboard.git
cd ecommerce-admin-dashboard
npm install
npm run env:init
npm run dev
```

| Service | URL |
| :------ | :-- |
| Admin | `http://localhost:5174` |
| API | `VITE_API_BASE_URL` in `.env.local` (from `npm run env:init`, default `http://localhost:3000`) |

If you remapped the API port, match that value in `.env.local`. After the API contract changes, run `npm run api:generate` while the API is up.

Client rules: [`docs/API-INTEGRATION.md`](docs/API-INTEGRATION.md). Security: [`SECURITY.md`](SECURITY.md).

---

<a id="verify"></a>

## Verify

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e    # needs API + seed + E2E_ADMIN_* (see e2e/README.md)
```

Pull-request CI runs lint, typecheck, unit tests, and build. Playwright runs on `workflow_dispatch` and on push to `main`/`master`; that job fails if `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` are unset. See [`.github/workflows/ci.yml`](.github/workflows/ci.yml) and [`e2e/README.md`](e2e/README.md).

---

<a id="architecture"></a>

## Architecture

Browser → Vite SPA (React Router) → versioned HTTP API. Auth flow, RBAC chrome, and folder layout: [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md).

---

<a id="tech-stack"></a>

## Tech stack

| Layer | Choice |
| :---- | :----- |
| App | Vite + React 19 |
| Routing | React Router |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS + shadcn/ui (Radix) |
| Client data | TanStack Query |
| Tables | TanStack Table |
| Local UI state | React state; Zustand if several trees need the same UI state |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| API | Typed OpenAPI client (`openapi-fetch`) |
| Tests | Vitest, Testing Library, Playwright |

---

<a id="documentation"></a>

## Documentation

| Document | Description |
| :------- | :---------- |
| [`SECURITY.md`](SECURITY.md) | Frontend security baseline |
| [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md) | SPA architecture, auth flow, folder map |
| [`docs/architecture/adr/README.md`](docs/architecture/adr/README.md) | Architecture decision records |
| [`docs/API-INTEGRATION.md`](docs/API-INTEGRATION.md) | Client integration rules (OpenAPI is the contract) |
| [`docs/ai/CONVENTIONS.md`](docs/ai/CONVENTIONS.md) | Feature layout, Query, forms, guards |
| [`AGENT.md`](AGENT.md) | Contributor and agent conventions |
| [`docs/README.md`](docs/README.md) | Docs index |
| API docs | [`ecommerce-store-api/docs`](https://github.com/raouf-b-dev/ecommerce-store-api/tree/master/docs) |

---

<a id="related-repositories"></a>

## Related repositories

| Repository | Role |
| :--------- | :--- |
| [`ecommerce-store-api`](https://github.com/raouf-b-dev/ecommerce-store-api) | Backend API |
| [`ecommerce-store-web`](https://github.com/raouf-b-dev/ecommerce-store-web) | Customer storefront (Next.js) |

---

<a id="project-layout"></a>

## Project layout

```
src/
├── app/                  # router, navigation
├── features/             # auth, products, orders, dashboard, etc.
├── components/           # layout shell + shared UI
├── lib/
│   ├── api/              # OpenAPI client, HTTP helpers
│   ├── auth/             # session, guards, AuthProvider
│   └── format.ts         # money/date helpers
docs/                     # architecture, integration, conventions
e2e/                      # Playwright (journey, a11y, keyboard, feature specs)
```

---

<a id="license"></a>

## License

[MIT](LICENSE)

---

Built by [Abderaouf .B](https://github.com/raouf-b-dev) | [Issues](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/issues) | [Repository](https://github.com/raouf-b-dev/ecommerce-admin-dashboard)
