# Security

Security baseline for this admin SPA. The API remains the authority for authn/authz and domain rules.

## Secrets and config

- Never commit `.env` or files with real credentials.
- `VITE_*` values are exposed to the browser. Never put API secrets, private keys, or long-lived credentials in Vite env vars.
- Local seed users live only in the API seeding doc. Do not copy passwords into this repository.

## Trust boundaries

- The browser is untrusted. Permission-aware nav is UX only; the API enforces every mutation and read.
- Do not bypass IDOR or RBAC in the client. A hidden button is not a security control.
- Map API errors to UI carefully. Prefer structured error fields; do not inject raw HTML from responses.

## Auth session

- Follow the API OpenAPI auth contract (cookies and/or bearer as documented).
- Prefer httpOnly, Secure cookies when available. Avoid `localStorage` for refresh/access tokens unless required and documented.
- On `401`, clear session UX and return to login. On `403`, show forbidden without retry loops that hammer the API.

## Admin-specific

- Assume XSS in the admin UI is high impact (operators have elevated privileges). Sanitize/escape user and API-derived strings in the DOM.
- Concurrent edits: honor API `409` / OCC instead of overwriting silently.

## Dependencies and supply chain

- Keep dependencies updated; run audits in CI once continuous integration is in place.
- Prefer an OpenAPI-generated client so request shapes stay aligned with the server.

## Reporting

If you find a vulnerability in this UI or its handling of the API, prefer a private report to the maintainer over a public issue when exploit detail is sensitive.
