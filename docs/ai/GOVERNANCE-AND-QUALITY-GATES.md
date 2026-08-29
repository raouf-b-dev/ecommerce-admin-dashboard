# Governance and Quality Gates

## Merge Gates

The baseline gates for this repository are:

- `npm run lint`
- `npm run typecheck`
- `npm run test`
- `npm run build`

Playwright smoke remains a local validation step until end-to-end CI is added.

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
