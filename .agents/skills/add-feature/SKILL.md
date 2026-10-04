---
name: add-feature
description: Add or extend an admin feature, page, route, nav item, query hook, mutation, API wrapper, Zod form, or table filter. Use when creating anything under src/features, src/app/router.tsx, or src/app/navigation.ts, or wiring a new OpenAPI endpoint into the UI.
---

# Add a feature

Rules behind each step: [CONVENTIONS.md](../../../docs/ai/CONVENTIONS.md). Copy the closest existing feature (`products` for CRUD with a form, `orders` for read plus transitions, `users` for filters) instead of inventing a shape.

## 1. Contract first

The generated client is the contract. Confirm the endpoint exists in `src/lib/api/generated/schema.d.ts`. If it does not, the API repo changes first, then `npm run api:generate` against a running API. Do not add an endpoint inventory or hand-written request types.

## 2. Layout

```text
src/features/<name>/
  api/<name>-api.ts          # one function per request, returns the DTO or throws
  hooks/use-<name>.ts        # TanStack Query hooks
  hooks/<name>-keys.ts       # key factory (see below for the shared case)
  components/                # feature UI
  pages/<name>-page.tsx      # one route entry, default and named export
  lib/<name>-list-filters.ts # URL <-> filters <-> API query
  schemas/<name>-schema.ts   # Zod, only with a form
  types.ts                   # aliases of generated DTOs
```

Specs go in `__tests__/` beside each folder. No `index.ts` barrels. Import other features by concrete module.

## 3. Build order

1. **types.ts**: `export type FooResponseDto = components['schemas']['FooResponseDto']`. Derive query and filter types from `operations[...]`.
2. **api/**: `const { data, error, response } = await apiClient.GET(...)`; on `error || !response.ok || !data` return `await throwApiErrorFromResponse(response, 'Failed to load foo')`. No `fetch`, no business rules, no casts.
3. **keys**: factory with `all` / `lists()` / `list(filters)` / `details()` / `detail(id)`. If the real-time provider also needs it, put it in `src/lib/query-keys/` (as `orderKeys`), because `lib/` cannot import `features/`.
4. **hooks/**: `useQuery` with `queryKey` from the factory and `staleTime`; lists use `placeholderData: keepPreviousData`. Mutations invalidate `lists()` and `detail(id)`, plus `dashboardKeys.all` when widgets read the data, and on a `409` (`isOptimisticLockConflict`) reload the detail.
5. **lib/filters** (tables): URL search params are the source of truth. Parse with type guards (`value is T`) and fall back to defaults, never `as`. Serialize only non-default values.
6. **schemas + forms**: React Hook Form + Zod aligned to the DTO. Map server errors with `applyApiFormErrors`; show mutation failures in `ActionErrorAlert`. No business validation.
7. **components/pages**: pages compose and call hooks; they never call `apiClient`. Show `QueryLoading`, `QueryStateAlert` with retry, and `TableEmptyState` for empty lists. The page title is the single `h1` (`PageHeader`).
8. **route**: add `lazy(() => import('@/features/<name>/pages/<name>-page'))` and the route to `src/app/router.tsx`, wrapped in `PermissionRoute` for gated pages. Add a `navigation.ts` entry with `permission`. The permission codes come from the API.
9. **tests**: use the `write-tests` skill. At minimum: filters helper, schema, API wrapper, mutation invalidation, and the page's empty, error, and forbidden states.
10. **docs**: if the feature changes routing, auth, or the architecture, update `docs/architecture/ARCHITECTURE.md` and consider an ADR (`write-docs` skill). Update `docs/ai/CODE-MAP.md` when a top-level folder or shared helper is added.

## Checks

- `npm run verify` passes.
- No `@/lib/mock/*` import in the feature (CONVENTIONS section 15).
- Hidden or disabled UI is paired with an API-enforced permission, never a client-only rule.
