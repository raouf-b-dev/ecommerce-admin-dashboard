# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- `VITE_DEMO_MODE` hosted demo banner (login + shell; points at README, no hardcoded email) and Live demo README section with read-only viewer credentials (`ADMIN_READONLY` / view_* only).

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
