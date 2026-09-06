# Governance and Quality Gates

## Merge Gates

The baseline gates for this repository (PR and the `ci` GitHub Actions job) are:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`
- `npm audit --omit=dev --audit-level=high`

Those checks run as parallel jobs. Require **CI Status Check** (`ci`) in branch protection, not the individual job names. Playwright joins that aggregator when the e2e job is scheduled (see below); a skipped e2e job does not fail `ci`.

Weekly Dependabot version updates (npm + GitHub Actions) live in [`.github/dependabot.yml`](../../.github/dependabot.yml). GitHub Dependency Review is not a gate here: it needs GitHub Advanced Security on a private repository.

Prettier is installed for local formatting. `format:check` is not a merge gate.

## Playwright

The `e2e` GitHub Actions job runs on:

| Event | Playwright |
| --- | --- |
| PR into `develop` (or any non-`main`/`master` branch) | No |
| PR into `master` or `main` | Yes |
| Push to `master` or `main` | Yes |
| `workflow_dispatch` | Yes |

That job **fails** if required e2e secrets are unset (admin, customer, and superadmin password; no skip-to-green). It is part of the `ci` aggregator. A skipped Playwright job (feature PRs into `develop`) does not fail `ci`; a failed or cancelled run does. On PRs into `master`/`main`, push to those branches, and `workflow_dispatch`, Playwright must succeed for `ci` to pass.

Require **CI Status Check** (`ci`) in branch protection, not the Playwright job by name. Requiring Playwright itself would block `develop` PRs where the job is skipped.

A full run needs a live seeded API (start and seed it from the API repo’s docs). Login is rate-limited; see [`e2e/README.md`](../../e2e/README.md) for worker layout. Generate a local `.secrets` file with `npm run env:init:secrets` (from [`.secrets.example`](../../.secrets.example)), fill passwords from the API seeding guide, and copy into GitHub Secrets. Do not commit `.secrets`.

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

ADRs are immutable historical documents for their **decision body**: do not edit Context / Decisions / Alternatives / Consequences. **Status** (and supersede header/index links) may be updated when a later ADR fully replaces one. Extend without replacement via a new ADR and `Does not supersede` (leave the prior ADR `Accepted`). See [`docs/architecture/adr/README.md`](../architecture/adr/README.md) and [`docs/ai/CONVENTIONS.md`](./CONVENTIONS.md) §14.
