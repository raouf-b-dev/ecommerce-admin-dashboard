# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.8.0] - 2026-10-28

Works with ecommerce-store-api v0.10.0 or later. The generated client matches API v0.11.0 (unchanged since 0.7.0).

### Added

- `VITE_DEMO_MODE` hosted demo banner (login + shell, no hardcoded email) ([#127](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/127)).
- `.npmrc` with `engine-strict=true` and a Dependabot `docker` entry (Node majors ignored) so the toolchain tracks the LTS in `.nvmrc`; Node version policy in CONTRIBUTING ([#139](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/139)).

### Changed

- **Breaking (contributors):** Node.js 26 LTS: `.nvmrc` 26, `engines` node `>=26.0.0` and npm `>=11.6.0`, Docker build stage pinned to `node:26.12.1-alpine3.24` by digest, local `setup-node-ci` action on the same `setup-node` v7.1.0 pin as `ci.yml` ([#139](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/139)).
- **Breaking (contributors):** npm 12.2.1 pinned through `devEngines.packageManager` (`onFail: error`); run `npm install -g npm@12.2.1` first. `setup-node-ci` installs it from `package.json` (and now also serves the Playwright job; the npm cache moves from setup-node (`cache: npm` and auto `package-manager-cache`, now `false`) to `actions/cache`, because setup-node's cache probe runs the bundled npm and fails on `devEngines`), and the Docker build stage installs it from `package.json` (no separate `NPM_VERSION` arg). No Node release bundles npm 12 yet. `devEngines.runtime` (node `>=26.0.0`, `onFail: error`) restores the Node guardrail, because npm 12 does not enforce root `engines.node` ([#140](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/140), [#141](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/141)).
- MSW 3: `onUnhandledRequest` renamed to `onUnhandledFrame`, `public/mockServiceWorker.js` regenerated ([#134](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/134)); handlers import from `msw/http` ([#141](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/141)).
- `SegmentedControl` requires a group `ariaLabel` (no generic default) and an `ariaLabel` only for non-text options, so text options keep their visible label as the accessible name ([#141](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/141)).
- New `positive` and `negative` theme tokens (WCAG AA in light and dark) for the trend pill and inventory stock state; the product price currency badge uses the `secondary` token pair. Fixes axe `color-contrast` failures ([#141](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/141)).
- Dependency updates: production deps (`@hookform/resolvers` 6.0.0, TanStack Query 5.104.5, lucide-react 1.61, React 19.3.1, React Router 8.5), dev deps (`@axe-core/playwright` 4.14, Playwright 1.64.1, ESLint 10.13, jsdom 30.1.3, PostCSS 8.5.31, typescript-eslint 8.72, Vite 8.3.5, Vitest 5.0.5), `postcss-selector-parser` 6.1.5 lockfile bump, GitHub Actions `actions/cache` 6.1.0 and `docker/login-action` 4.7.0 ([#123](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/123), [#124](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/124), [#128](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/128), [#130](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/130), [#131](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/131), [#132](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/132), [#133](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/133)).

- README: hosted demo is coming soon; local sign-in links point to the platform README ([#143](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/143)).

### Fixed

- axe-core 4.14 violations: low-stock text contrast and the user menu `label-content-name-mismatch` ([#136](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/136)).
- `npm install` no longer fails with `ERESOLVE`: `oxc-transform-react` is back on `^0.152.0`, the peer range of `@vitejs/plugin-react` 6.1.2 ([#141](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/141)).

[Compare v0.7.0...v0.8.0](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/compare/v0.7.0...v0.8.0)

## [0.7.0] - 2026-10-18

Works with ecommerce-store-api v0.10.0 or later. The generated client matches API v0.11.0.

### Added

- Production Docker image (nginx unprivileged, port 8080) published to `ghcr.io/raouf-b-dev/ecommerce-admin-dashboard` for linux/amd64 and linux/arm64 on pushes to master and `v*` tags. The API origin is read at container start from `API_BASE_URL` instead of being compiled in ([#118](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/118)).

### Changed

- Null customer/shipping/SKU display paths reuse `formatOptionalText` for a consistent dash fallback ([#117](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/117)).

[Compare v0.6.0...v0.7.0](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/compare/v0.6.0...v0.7.0)

## [0.6.0] - 2026-10-17

Works with ecommerce-store-api v0.10.0 or later. The generated client matches v0.11.0.

### Changed

- **Breaking:** production builds require `VITE_API_BASE_URL` and fail at startup without it instead of calling localhost ([#113](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/113)).
- Generated API client synced with API v0.11.0: order customer name/email, shipping address and item SKU may be null and render as `-` ([#113](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/113)).
- `npm run test:e2e` installs Playwright Chromium first through a `pretest:e2e` hook; it downloads only when missing ([#113](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/113)).
- Dependency updates: production deps (Radix UI dialog/dropdown/label/slot, TanStack Query and Table, lucide-react, react-hook-form, socket.io-client, zod), dev deps (Playwright 1.64, Vite 8.3, Vitest 5.0.4, ESLint 10.12 and others), `brace-expansion` and `source-map-js` lockfile bumps, GitHub Actions `setup-node` 7.1.0 ([#95](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/95), [#103](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/103), [#105](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/105), [#106](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/106), [#107](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/107)).

### Fixed

- `npm install` resolves the `oxc-transform-react` peer conflict (pinned to 0.152.x for `@vitejs/plugin-react`), MSW install scripts are allowed, and `npm run verify` finds the npm CLI through `npm_execpath` on Windows and Unix ([#110](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/110)).

[Compare v0.5.0...v0.6.0](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/compare/v0.5.0...v0.6.0)

## [0.5.0] - 2026-10-15

Works with ecommerce-store-api v0.10.0 or later.

### Added

- Platform config integration: the display currency comes from `GET /v1/platform/config`. Operator user menu in the header ([#93](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/93)).
- Payment method labels ([#94](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/94)).
- Demo-data banner in mock mode, on the login page and in the app shell. Follow-up to [#74](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/74), which 0.4.1 left out.

### Changed

- **Breaking:** payment method `CARD` replaces `STRIPE`. Requires ecommerce-store-api v0.10.0 ([#94](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/94)).
- Product create and update always send `currency`, matching the API v0.10.0 contract ([#94](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/94)).
- Responsive admin shell below desktop widths ([#90](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/90)).
- Tests use the production compiler; mobile Playwright projects added ([#91](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/91)).
- Slimmer agent guidance ([#88](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/88)).
- Regenerated README showcase stills and walkthrough for the 0.5.0 shell (user menu, demo banner, payment labels).

### Fixed

- Only optimistic lock conflicts are treated as version conflicts ([#92](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/92)).
- CI status gate uses `E2E_STATUS` ([#82](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/82)).
- E2E CI boots the API from the NestJS 12 `dist/main.js` layout and keeps phone project viewports ([#100](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/100)).

[Compare v0.4.1...v0.5.0](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/compare/v0.4.1...v0.5.0)

## [0.4.1] - 2026-09-29

Does **not** include the mock demo-data banner ([#74](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/74)). That stays a follow-up on `develop` after this cut.

### Changed

- Zod 4 (`z.email()` and updated validation message keys).
- AUTHORS heading aligned with the sibling repos.
- Vitest 5; GitHub Actions `checkout` v7 and `setup-node` v7.

## [0.4.0] - 2026-09-28

Works with ecommerce-store-api v0.9.0 or later.

### Added

- Brand color tokens and typography foundation.
- Product thumbnails and URL image preview.
- Categories in the primary sidebar navigation.
- Themed Recharts tooltips.
- Mock product images synced with updated API contracts.

[Compare v0.3.0...v0.4.0](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/compare/v0.3.0...v0.4.0)

## [0.3.0] - 2026-09-19

Operator polish after v0.2.0: session persistence for refresh-token lifetime, architecture boundary hardening, OpenAPI/MSW sync with API v0.8.0, regenerated showcase assets, guided empty-state checklist. Payments on order detail stayed read-only.

[Compare v0.2.0...v0.3.0](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/compare/v0.2.0...v0.3.0)

## [0.2.0] - 2026-09-06

First tagged operator SPA. Login, forced password change, dashboard, products, categories, inventory, orders, users, roles, MSW preview, theme, WebSocket toasts. Package `0.1.0` was never tagged. Targets API v0.7.0.

[Compare v0.2.0](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/releases/tag/v0.2.0)
