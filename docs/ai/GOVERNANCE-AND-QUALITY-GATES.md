# Governance and Quality Gates

## Merge Gates

The baseline gates for this repository (PR and the `ci` GitHub Actions job) are:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm audit --omit=dev --audit-level=high`

Those checks run as parallel jobs. Require **CI Status Check** (`ci`) in branch protection, not the individual job names. Pull requests also run GitHub Dependency Review (failure fails `ci`; skipped on push).

Prettier is installed for local formatting. `format:check` is not a merge gate.

## Playwright

Playwright is **not** a pull-request merge gate. A full run needs a seeded API (Postgres, Redis, migrations, `db:seed`), shares one admin account, and must use `workers: 1` because login is throttled at 10/min.

The `e2e` GitHub Actions job runs on:

- `workflow_dispatch`
- `push` to `main` or `master`

That job **fails** if `E2E_ADMIN_EMAIL` or `E2E_ADMIN_PASSWORD` are unset (no skip-to-green). It is not part of the `ci` aggregator, so merge-gate status stays independent of Playwright. Generate a local reference file with `npm run env:init:secrets` (from [`.secrets.example`](../../.secrets.example)); copy into GitHub Secrets. Demo values match API `docs/development/SEEDING.md` — do not commit `.secrets`.

Locally, authenticated specs skip when those variables are missing (see [`e2e/README.md`](../../e2e/README.md)).

## Definition of Done

A feature is not done until:

1. It uses the OpenAPI contract or generated client for integration.
2. Component or unit tests for the new behavior pass.
3. Lint and typecheck pass.
4. Any relevant API integration or security notes stay accurate.
5. Manual verification confirms the UI behavior that changed.

## Escalation Cases

Stop and clarify when:

- auth/session behavior is ambiguous
- CORS or cookie behavior differs from the expected contract
- API docs and runtime behavior disagree
- a change tempts the UI to own domain rules

## ADR triggers

Write an ADR in `docs/architecture/adr/ADR-XXXX-[title].md` when a change affects:

- Auth-first routing shape or guard behavior (including operator gates)
- Session/token storage strategy
- Mid-request auth recovery (silent refresh / retry policy)
- Client RBAC chrome boundaries or permission resolution approach
- New global state patterns (e.g. replacing TanStack Query for server data)

### ADR lifecycle states

- **`Proposed`**: Written during design; awaiting approval
- **`Accepted`**: Approved and in effect
- **`Deprecated`**: No longer recommended
- **`Superseded`**: Obsoleted by a later ADR (must link the successor)

ADRs are immutable historical documents for their **decision body** — do not edit Context / Decisions / Alternatives / Consequences. **Status** (and supersede header/index links) may be updated when a later ADR fully replaces one. Extend without replacement via a new ADR and `Does not supersede` (leave the prior ADR `Accepted`). See [`docs/architecture/adr/README.md`](../architecture/adr/README.md) and [`docs/ai/CONVENTIONS.md`](./CONVENTIONS.md) §14.
