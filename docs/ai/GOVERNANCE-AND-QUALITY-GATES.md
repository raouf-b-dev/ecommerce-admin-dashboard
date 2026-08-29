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

- Auth-first routing shape or guard behavior
- Session/token storage strategy
- Client RBAC chrome boundaries or permission resolution approach
- New global state patterns (e.g. replacing TanStack Query for server data)

Follow the index and naming rules in [`docs/architecture/adr/README.md`](../architecture/adr/README.md).
