# Changelog

All notable changes to this project are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.5.0] - 2026-10-15

Works with ecommerce-store-api v0.10.0 or later.

### Added

- Platform config integration: the display currency comes from `GET /v1/platform/config`. Operator user menu in the header ([#93](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/93)).
- Payment method labels ([#94](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/94)).
- Demo-data banner in mock mode, on the login page and in the app shell. Follow-up to [#74](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/74), which 0.4.1 left out.

### Changed

- **Breaking:** payment method `CARD` replaces `STRIPE`. Requires ecommerce-store-api v0.10.0 ([#94](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/94)).
- Responsive admin shell below desktop widths ([#90](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/90)).
- Tests use the production compiler; mobile Playwright projects added ([#91](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/91)).
- Slimmer agent guidance ([#88](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/88)).

### Fixed

- Only optimistic lock conflicts are treated as version conflicts ([#92](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/92)).
- CI status gate uses `E2E_STATUS` ([#82](https://github.com/raouf-b-dev/ecommerce-admin-dashboard/pull/82)).

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
