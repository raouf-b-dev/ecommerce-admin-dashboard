# E-commerce Admin Dashboard

<p align="center">
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
- [Architecture](#architecture)
- [Tech stack](#tech-stack)
- [Documentation](#documentation)
- [Related repositories](#related-repositories)
- [Project layout](#project-layout)
- [License](#license)

---

<a id="what-this-is"></a>

## What this is

Vite + React single-page app for store operators. Product and inventory management, order handling, customer views, and navigation that respects RBAC.

It calls the NestJS ecommerce API (versioned HTTP; see OpenAPI). The UI can hide or disable actions based on permissions, but the API authorizes every request. The same API also serves the customer storefront and can serve mobile later.

**Current limits**

| Topic | Status |
| :---- | :----- |
| Application code | Not scaffolded yet. Build order: [`docs/ROADMAP.md`](docs/ROADMAP.md). |
| Hosted demo | None yet. Run locally. |
| Analytics | Dashboard numbers come from API read models when those exist. |
| BFF | Not used. Talks to the API directly. |

---

<a id="quick-start"></a>

## Quick start

### Prerequisites

- **Node.js** >= 24
- **npm** >= 11
- Local [ecommerce-store-api](https://github.com/raouf-b-dev/ecommerce-store-api) on `http://localhost:3000`

### Run the API first

Follow the API local boot guide (do not fork script names here; they can change):

[`docs/development/LOCAL-SETUP.md`](https://github.com/raouf-b-dev/ecommerce-store-api/blob/master/docs/development/LOCAL-SETUP.md)

Seeded admin account: API [`docs/development/SEEDING.md`](https://github.com/raouf-b-dev/ecommerce-store-api/blob/master/docs/development/SEEDING.md) (local fixtures only; never production).

### Run this app (after scaffold)

```bash
cd ../ecommerce-admin-dashboard
npm install
cp .env.example .env
npm run dev
```

| Service | URL |
| :------ | :-- |
| Admin | `http://localhost:3200` (confirm in project config) |
| API | `http://localhost:3000` |
| Swagger (contract) | `http://localhost:3000/api` |

Client rules: [`docs/API-INTEGRATION.md`](docs/API-INTEGRATION.md). Security baseline: [`SECURITY.md`](SECURITY.md).

---

<a id="architecture"></a>

## Architecture

```text
Browser -> Vite SPA (React Router) -> versioned HTTP API -> ecommerce-store-api
                                                          ^
Storefront / mobile apps ---------------------------------+
```

| Rule | Detail |
| :--- | :----- |
| Boundary | Status changes, stock, refunds, and RBAC live in the API. |
| Data access | Typed client from the API OpenAPI/Swagger spec. |
| Client data | TanStack Query for lists, detail, and mutations. |
| Tables | TanStack Table for admin grids. |
| Auth / RBAC UX | Hide or disable controls from claims. Do not treat that as security. |
| Conflicts | Show HTTP 409 so the operator can reload and retry. |

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
| Local UI state | React state; Zustand only when several trees need the same UI state |
| Forms | React Hook Form + Zod |
| Charts | Recharts (dashboard widgets) |
| API | Typed OpenAPI client |
| Tests | Vitest, Testing Library, Playwright |

---

<a id="documentation"></a>

## Documentation

| Document | Description |
| :------- | :---------- |
| [`SECURITY.md`](SECURITY.md) | Frontend security baseline |
| [`docs/ROADMAP.md`](docs/ROADMAP.md) | Delivery plan, tests-with-features, ship gates |
| [`docs/API-INTEGRATION.md`](docs/API-INTEGRATION.md) | Client integration rules (OpenAPI is the contract) |
| [`docs/README.md`](docs/README.md) | Docs index |
| [`docs/ai/README.md`](docs/ai/README.md) | Agent and conventions docs |
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

Target layout (may shift slightly with the scaffold):

```
src/
├── app/                  # router, providers, shell
├── features/             # products, orders, etc.
├── components/           # shared UI
├── lib/
│   ├── api/              # OpenAPI client, HTTP helpers
│   └── auth/             # session helpers matching the API
docs/
  API-INTEGRATION.md
  ROADMAP.md
  ai/                     # agent conventions
```

---

<a id="license"></a>

## License

[MIT](LICENSE)

---

Built by [Abderaouf .B](https://github.com/raouf-b-dev) | [Issues](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/issues) | [Repository](https://github.com/raouf-b-dev/ecommerce-admin-dashboard)
