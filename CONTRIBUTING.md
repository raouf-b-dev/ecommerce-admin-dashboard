# Contributing

Thanks for your interest in improving the admin dashboard. This repository is an operator SPA. Domain rules and authorization are enforced by the [API](https://github.com/raouf-b-dev/ecommerce-store-api); the UI may hide controls for UX only.

## Code of Conduct

By participating, you agree to the [Code of Conduct](CODE_OF_CONDUCT.md).

## How we accept changes

1. **Fork** this repository (write access on the upstream is not expected).
2. Create a branch from `develop` (`feature/...`, `fix/...`, or `docs/...`).
3. Open a **pull request** into `develop` (or `master` only when maintainers ask for a release hotfix).
4. Keep PRs focused. Large refactors should be discussed in an issue first.

Do not push directly to `master` or `develop`. Force-pushes and branch deletion on the upstream are blocked by repository rulesets.

## Local setup

Requires Node.js LTS (see `.nvmrc`, currently 26) and npm 12.2.1 (see npm version policy below).

### Node version policy

- `.nvmrc` is the single source of truth. CI reads it through `actions/setup-node` (`node-version-file`).
- The Dockerfile build stage pin (`node:<version>-alpine@sha256:...`) and `engines` in `package.json` follow it. `.npmrc` sets `engine-strict=true`, so `npm install` fails on an older Node or npm. npm 12 does not enforce root `engines.node` even with `engine-strict`, so `devEngines.runtime` (`node` `>=26.0.0`, `onFail: "error"`) keeps the Node guardrail. Change it together with `engines.node`.
- Dependabot bumps the Docker image within the current major and ignores Node majors.
- To move to a new LTS major, edit `.nvmrc`, the Dockerfile pin and `engines` in one PR.

### npm version policy

- `devEngines.packageManager` in `package.json` (`npm` `12.2.1`, `onFail: "error"`) is the single source of truth. Any project command (`npm ci`, `npm install`, `npm run`) on another npm version fails with `EBADDEVENGINES`.
- Why: no Node.js release bundles npm 12 yet (Node 26.12.1 ships npm 11.20.0), and `actions/setup-node` has no npm version input. So npm is installed explicitly: run `npm install -g npm@12.2.1` locally (global installs are not blocked by `devEngines`). CI does the same in `.github/actions/setup-node-ci`, reading the version from `package.json`, and the Dockerfile build stage uses its `NPM_VERSION` arg.
- There is no top-level `packageManager` field, so Corepack stays off. `engines.npm` stays the consumer floor (`>=11.6.0`); `devEngines` is the stricter contributor pin.
- npm 12 blocks dependency install scripts unless `allowScripts` in `package.json` allows them. Review with `npm install-scripts ls`, record with `npm install-scripts approve`, then `npm rebuild`. Today no dependency needs one (only optional macOS `fsevents` has one).
- To bump npm, change `devEngines.packageManager.version` and `NPM_VERSION` in the Dockerfile in one PR. Revisit this pin (and drop the explicit install) once a Node LTS release bundles npm 12.

```bash
git clone https://github.com/YOUR_USERNAME/ecommerce-admin-dashboard.git
cd ecommerce-admin-dashboard
npm install
npm run env:init
```

| Goal | Command |
| :--- | :------ |
| UI without a backend | `npm run dev:mock` → [http://localhost:5174](http://localhost:5174) (Demo 1-Click Login) |
| Full stack | Start the [API](https://github.com/raouf-b-dev/ecommerce-store-api) on port **3000**, then `npm run dev` |
| Refresh OpenAPI types | With the API running: `npm run api:generate` |
| Verify mock handlers (no API) | `npx vitest run src/lib/mock` - contract tests for product filters and demo auth |

Seeded operator credentials: API [seeding guide](https://github.com/raouf-b-dev/ecommerce-store-api/blob/master/docs/development/SEEDING.md). First login may require a password change.

Details: [README](README.md). Client rules: [`docs/API-INTEGRATION.md`](docs/API-INTEGRATION.md).

## Project rules (non-negotiable)

- Use the **live OpenAPI / generated client**. Do not invent list filters, mutations, or status transitions the API does not expose.
- No BFF: the browser talks to the API directly.
- Treat permission-aware nav as UX only; never bypass IDOR or RBAC in the client.
- Follow conventions in [`AGENTS.md`](AGENTS.md) and [`docs/ai/`](docs/ai/) when touching app structure.

## Before you open a PR

```bash
npm run verify   # lint, typecheck, unit tests, build
```

Playwright needs a live API; see CI notes in the README. Prefer unit/component coverage for feature UI in the same PR.

### PR checklist

- [ ] Targets `develop` from a fork branch
- [ ] Lint, typecheck, and unit tests pass locally
- [ ] OpenAPI client regenerated if the contract changed
- [ ] No secrets in `VITE_*` or committed env files
- [ ] Docs updated when behavior or setup changes

## Issues and security

- **Bugs / features:** open a GitHub issue with reproduction steps or a clear problem statement.
- **Security:** do not file a public issue with exploit detail. Follow [`SECURITY.md`](SECURITY.md). Admin XSS and privilege issues are high impact; report privately.

## Related repositories

| Repository | Role |
| :--------- | :--- |
| [ecommerce-store-api](https://github.com/raouf-b-dev/ecommerce-store-api) | Backend |
| [ecommerce-store-web](https://github.com/raouf-b-dev/ecommerce-store-web) | Customer storefront |

Questions welcome via issues. Maintainers will review PRs as capacity allows.
