# E-commerce Admin Dashboard

<p align="center">
  <a href="https://github.com/raouf-b-dev/ecommerce-admin-dashboard/actions"><img src="https://github.com/raouf-b-dev/ecommerce-admin-dashboard/actions/workflows/ci.yml/badge.svg" alt="CI"></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white" alt="TypeScript"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19-61DAFB?style=flat&logo=react&logoColor=black" alt="React"></a>
  <a href="https://vitejs.dev/"><img src="https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white" alt="Vite"></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white" alt="Tailwind CSS"></a>
  <a href="https://tanstack.com/query"><img src="https://img.shields.io/badge/TanStack-Query-FF4154?style=flat&logo=react-query&logoColor=white" alt="TanStack Query"></a>
  <a href="#try-live-demo-zero-setup"><img src="https://img.shields.io/badge/Try%20Live%20Demo-Zero%20Setup-0A7B3E?style=flat" alt="Try Live Demo (Zero Setup)"></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-green.svg" alt="License"></a>
</p>

> Admin SPA for the [E-commerce Store API](https://github.com/raouf-b-dev/ecommerce-store-api). Built with React and Vite. Business rules stay in the API.

<a id="try-live-demo-zero-setup"></a>

**Try Live Demo (Zero Setup)** — no Docker, Postgres, Redis, or API required:

```bash
git clone https://github.com/raouf-b-dev/ecommerce-admin-dashboard.git
cd ecommerce-admin-dashboard
npm install
npm run env:init
npm run dev:mock
```

Open `http://localhost:5174` and use **Demo 1-Click Login**.

A public hosted demo is not published yet. The mock static build is ready for that (`npm run build:mock`, `vercel.json`).

Mock mode is demo-only. Playwright e2e still targets a real API.

## Table of Contents

- [What this is](#what-this-is)
- [Quick start](#quick-start)
- [Live static build](#live-static-build)
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

The same backend is meant to serve a customer storefront in `ecommerce-store-web` (this workspace). That app is not a public GitHub repository yet.

**Current limits**

| Topic           | Status                                                                           |
| :-------------- | :------------------------------------------------------------------------------- |
| Feature screens | Auth, products, inventory, orders, users, roles, and dashboard are wired to OpenAPI. |
| Operational UX  | Dark / Light / System theme (zero-FOUC) and live WebSocket toast feed for incoming orders/stock. |
| Dashboard       | Operational cockpit (analytics overview, revenue series, alerts, recent orders). |
| Navigation      | Safe landing for restricted operators; landing gates prevent 403 loops on `/`.  |
| Zero-backend demo | `npm run dev:mock` (MSW) + `npm run build:mock` / `vercel.json` for static mock builds. |
| Public hosted demo | Not published yet; local `dev:mock` and static mock packaging are available.     |

---

<a id="quick-start"></a>

## Quick start

### Prerequisites

- **Node.js** >= 24
- **npm** >= 11
- A running [ecommerce-store-api](https://github.com/raouf-b-dev/ecommerce-store-api) instance. Follow that repository’s [README](https://github.com/raouf-b-dev/ecommerce-store-api#quick-start) (or [local setup](https://github.com/raouf-b-dev/ecommerce-store-api/blob/master/docs/development/LOCAL-SETUP.md)) so commands, ports, and Docker requirements stay current there.

### Option 1: Host Vite against a live API (recommended for development)

Connects to a running API instance (default `http://localhost:3000`). Run the admin SPA on your host so port **5174** stays on Vite with instant HMR and browser DevTools.

**1. Start the API** from a separate clone, following the API repository’s own docs (linked above).

**2. Start this dashboard:**

```bash
git clone https://github.com/raouf-b-dev/ecommerce-admin-dashboard.git
cd ecommerce-admin-dashboard
npm install
npm run env:init
npm run dev
```

Open `http://localhost:5174`. Sign in as the seeded **administrator** from the API [seeding guide](https://github.com/raouf-b-dev/ecommerce-store-api/blob/master/docs/development/SEEDING.md) (do not copy passwords into this repo). The first login **requires a password change** before the admin shell. After that, you should see the dashboard and a Log out control.

Operator walkthrough (search, stock adjust, order Process/Ship, addresses, superadmin role change): [`docs/RELEASE-GATE.md`](docs/RELEASE-GATE.md).

| Service | URL                                                                                            |
| :------ | :--------------------------------------------------------------------------------------------- |
| Admin   | `http://localhost:5174`                                                                        |
| API     | `VITE_API_BASE_URL` in `.env.local` (from `npm run env:init`, default `http://localhost:3000`) |

If you remapped the API port, match that value in `.env.local`. After the API contract changes, run `npm run api:generate` while the API is up.

---

<a id="live-static-build"></a>

## Live static build

Prove a production bundle against a configured API origin. `npm run dev` and `npm run preview` both bind port **5174** with `strictPort` — **stop the Vite dev server first**.

```bash
VITE_API_BASE_URL="http://localhost:3000" npm run build
npm run preview
```

```powershell
$env:VITE_API_BASE_URL="http://localhost:3000"
npm run build
npm run preview
```

Open `http://localhost:5174`, sign in (complete forced password change if the seed flag is still set), and load one list page.

`npm run build:mock` and `vercel.json` package the **mock** SPA only. They do not validate a live API origin.

---

### Option 2: Run without an API (Mock Mode with MSW)

```bash
npm run env:init
npm run dev:mock
```

Uses MSW handlers and seed data. On the login screen, click **Demo 1-Click Login** (`admin@store.local`, any password). Session survives refresh via `sessionStorage`; mutable mock data resets on full reload.

Client rules: [`docs/API-INTEGRATION.md`](docs/API-INTEGRATION.md). Security: [`SECURITY.md`](SECURITY.md).

---

<a id="verify"></a>

## Verify

```bash
npm run lint
npm run typecheck
npm test
npm run build
npm run test:e2e    # live API + E2E_* (see e2e/README.md). Run before manual order Process/Ship.
```

Pull-request CI runs lint, typecheck, unit tests, build, and a production-dependency audit in parallel. Require the **CI Status Check** job in branch protection. Dependabot opens weekly update PRs ([`.github/dependabot.yml`](.github/dependabot.yml)). Playwright runs on `workflow_dispatch` and on push to `main`/`master`; that job fails if `E2E_ADMIN_EMAIL` / `E2E_ADMIN_PASSWORD` are unset. See [`.github/workflows/ci.yml`](.github/workflows/ci.yml) and [`e2e/README.md`](e2e/README.md).

---

<a id="architecture"></a>

## Architecture

Browser → Vite SPA (React Router) → versioned HTTP API. Auth flow, RBAC chrome, and folder layout: [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md).

---

<a id="tech-stack"></a>

## Tech stack

| Layer          | Choice                                                       |
| :------------- | :----------------------------------------------------------- |
| App            | Vite + React 19                                              |
| Routing        | React Router                                                 |
| Language       | TypeScript (strict)                                          |
| Styling        | Tailwind CSS + shadcn/ui (Radix) + Dark/Light Theme Provider |
| Real-time / UI | Socket.IO client (`socket.io-client`) + Sonner toasts        |
| Client data    | TanStack Query                                               |
| Tables         | TanStack Table                                               |
| Local UI state | React state; Zustand if several trees need the same UI state |
| Forms          | React Hook Form + Zod                                        |
| Charts         | Recharts                                                     |
| API            | Typed OpenAPI client (`openapi-fetch`)                       |
| Tests          | Vitest, Testing Library, Playwright                          |

---

<a id="documentation"></a>

## Documentation

| Document                                                                 | Description                                                                                       |
| :----------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| [`SECURITY.md`](SECURITY.md)                                             | Frontend security baseline                                                                        |
| [`docs/architecture/ARCHITECTURE.md`](docs/architecture/ARCHITECTURE.md) | SPA architecture, auth flow, folder map                                                           |
| [`docs/architecture/adr/README.md`](docs/architecture/adr/README.md)     | Architecture decision records                                                                     |
| [`docs/API-INTEGRATION.md`](docs/API-INTEGRATION.md)                     | Client integration rules (OpenAPI is the contract)                                                |
| [`docs/RELEASE-GATE.md`](docs/RELEASE-GATE.md)                           | Live API stranger boot and operator smoke checklist                                               |
| [`docs/ai/CONVENTIONS.md`](docs/ai/CONVENTIONS.md)                       | Feature layout, Query, forms, guards                                                              |
| [`AGENT.md`](AGENT.md)                                                   | Contributor and agent conventions                                                                 |
| [`docs/README.md`](docs/README.md)                                       | Docs index                                                                                        |
| API docs                                                                 | [`ecommerce-store-api/docs`](https://github.com/raouf-b-dev/ecommerce-store-api/tree/master/docs) |

---

<a id="related-repositories"></a>

## Related repositories

| Repository                                                                  | Role                          |
| :-------------------------------------------------------------------------- | :---------------------------- |
| [`ecommerce-store-api`](https://github.com/raouf-b-dev/ecommerce-store-api) | Backend API                   |
| `ecommerce-store-web` | Customer storefront (Next.js). Sibling repository; not published on GitHub yet. |

---

<a id="project-layout"></a>

## Project layout

```
src/
├── app/                  # router, navigation
├── features/             # auth, products, orders, dashboard, etc.
├── components/           # layout shell, theme provider/toggle, shared UI
├── lib/
│   ├── api/              # OpenAPI client, RFC 9110 HTTP error helpers
│   ├── auth/             # session, guards, AuthProvider, safe landing
│   ├── ws/               # WebSocket gateway client & notification bus
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
