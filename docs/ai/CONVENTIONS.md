# Admin SPA Conventions

## 1. Architecture Boundary

- Keep domain rules in `ecommerce-store-api`.
- UI guards, disabled actions, and hidden navigation are UX only.
- Prefer the OpenAPI-generated client for API calls. Do not spread ad-hoc `fetch` calls through feature code.

## 2. Feature Layout

Use `src/features/<feature-name>/` for feature-owned code.

Typical shape:

```text
src/features/products/
  api/
  components/
  hooks/
  schemas/
  types/
```

Keep cross-feature primitives in `src/components/` and cross-feature utilities in `src/lib/`.

## 3. Query and Mutation Rules

- TanStack Query owns server-state caching.
- Query keys should be stable tuples with the feature name first.
- Mutation success handlers must invalidate or update the exact affected queries.
- Do not cache authorization assumptions separately from API-backed session state.

## 4. Table Query Mapping

- Bind TanStack Table pagination, sorting, and filter state to URL search params.
- Map those params to whatever the active OpenAPI query schema defines.
- Do not hardcode query parameter names that are not present in the contract.

## 5. Forms and Errors

- Use React Hook Form + Zod for form state and client validation.
- Align schemas to API DTOs.
- Display structured API validation errors in the form when possible.
- Do not invent business validation rules that belong in the API.

## 6. Auth and Security

- Browser configuration uses `VITE_*` public values only.
- Prefer httpOnly cookie sessions when the API supports them.
- Avoid `localStorage` for long-lived tokens.
- Treat rendered API strings as untrusted data.

## 7. Concurrency

- When the API returns `409`, reload the entity and let the operator retry.
- Do not silently overwrite server state after a conflict.

## 8. Testing

- Add component tests in the same phase as the UI they cover.
- Extend Playwright smoke when a feature joins the critical path.
- Keep tests focused on user-visible behavior and contract wiring.
