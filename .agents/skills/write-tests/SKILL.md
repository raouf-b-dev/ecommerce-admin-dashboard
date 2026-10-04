---
name: write-tests
description: Write or fix Vitest and Testing Library specs with typed mocks and no casts. Use when adding or editing a *.spec.ts or *.spec.tsx, covering a helper, schema, API wrapper, hook, component, page, or route guard, or removing `as`/`any` from an existing spec.
---

# Write tests

Copy the closest golden spec in [references/golden-specs.md](references/golden-specs.md), then adapt it.

## Rules

1. Put `<name>.spec.ts(x)` in the `__tests__/` folder beside the code (`components/__tests__/`, `lib/__tests__/`, `pages/__tests__/`). One `describe` per unit, `it('<result> when <condition>')`.
2. Cover the success path, each error branch, and permission: a user without the permission sees the forbidden or hidden state.
3. Test user-visible behavior and contract wiring. Query by role and label (`getByRole`, `getByLabelText`); use `userEvent` for new specs.
4. Never wrap `expect` in `if`, `try`, or a loop over results: the test passes when the branch is skipped. Assert the whole shape with `toMatchObject`, `rejects.toMatchObject`, `expect.arrayContaining`, or split the cases with `it.each`. To narrow a value for later code, use a guard that throws, not an `if` around assertions.
5. Build data with `satisfies <Dto>` objects or typed factories at the top of the spec. Shared helpers live in `src/test/` (`create-test-jwt.ts`). No large inline literals repeated across tests.
6. Hook-mocked page and component specs render without `QueryClientProvider`. Hook and `*-api` specs use a real `QueryClient` and mock the API module (CONVENTIONS section 12).
7. Reset state: `mockReset()` in `beforeEach`, or return fresh stubs from a `setup()` function.

## Typed mocks, in order of preference

1. **Callback props**: `vi.fn<() => Promise<void>>()` typed with the prop's signature. No module mock needed.
2. **A module you replace entirely** (an API module for a hook spec): `vi.mock('<path>')` with no factory, then `vi.mocked(fn).mockResolvedValue(...)`. `vi.mocked` infers the real signature, so values are checked.
3. **A module you replace with a factory** (hooks, `useAuth`): create the stub with `vi.hoisted(() => vi.fn<Signature>())` and return it from the factory. `Signature` must be a function type: `typeof useX` for the whole hook, `() => Pick<ReturnType<typeof useX>, 'data' | 'isError' | ...>` for a partial result (golden 6, 7), or `ReturnType<typeof useAuth>['hasPermission']` for a function member. `vi.fn<ReturnType<typeof useX>>()` does not compile. Import the hook with `import type`. When the hook's shape changes, the stub stops compiling.
4. **Partial data**: `{ ... } satisfies PaginatedOrdersResponseDto`. It checks fields without widening or asserting.
5. **A method on an object you own**: `vi.spyOn(obj, 'method')`.
6. **The generated client**: `vi.hoisted(() => vi.fn())` for `apiClient.GET`/`POST`, resolving the `{ data, error, response }` triple the wrapper reads (golden 3). This untyped stub is allowed only here, because the generated client's overloaded signatures cannot be expressed as one function type; build the resolved `data` with `satisfies <Dto>` so the contract is still checked.

Forbidden: AGENTS.md rule 1 (`as`, `as unknown as`, `any`, `@ts-ignore`). A test that must pass invalid input uses `// @ts-expect-error <reason>`. If a third-party type cannot be built, stop and ask: do not cast.

### Replacing existing casts in specs

Fix them when you touch the file, then run `npm run lint:prune`.

- `error: null as Error | null`, `data: undefined as X | undefined`: type the mock (`vi.fn<() => ListQuery>()`, golden 6) and the object literal is checked, no cast.
- `hasPermission: (() => false) as (permission: string) => boolean`: golden 7.
- `(await response.json()) as { accessToken?: string }`: `z.object({ accessToken: z.string().optional() }).parse(await response.json())`.
- `vi.mocked(fetch).mock.calls[0]?.[0] as Request`: `const [input] = ...; if (!(input instanceof Request)) throw new Error('expected a Request');`
- `vi.hoisted(() => [] as boolean[])`: declare the array with its type inside the callback and return it: `vi.hoisted(() => { const calls: boolean[] = []; return calls; })`.

## By layer

- **Helper or schema**: pure input/output (golden 1, 2). `it.each` for tables of cases.
- **API wrapper**: mock `@/lib/api/client`; assert the call arguments, the returned DTO, and the thrown `ApiRequestError` status (golden 3).
- **Hook**: real `QueryClient`; assert invalidation with `vi.spyOn(queryClient, 'invalidateQueries')` (golden 4). Mutations must invalidate `lists()` and `detail(id)`.
- **Component**: props and callbacks (golden 5).
- **Page**: mock the feature hooks module and `useAuth`; assert loading, empty, error-with-retry, and permission states (golden 6, 7).
- **Route guard**: `MemoryRouter`, mocked `useAuth` (golden 7).
- **Mock handlers (MSW)**: `src/lib/mock/handlers/handlers.spec.ts` shows the contract-test style; run `npx vitest run src/lib/mock`.
- **End to end**: Playwright in `e2e/` against a seeded API; see `e2e/README.md`. Add a spec only when a feature joins the critical path.

## Run

`npx vitest run <path>` while iterating, then `npm run verify`. After removing a baselined cast, run `npm run lint:prune` (AGENTS.md rule 1).
