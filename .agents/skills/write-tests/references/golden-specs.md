# Golden specs

Each block compiles, lints, and passes in this repo. Copy the closest one, rename, adapt. The first line is the file location; do not copy it. Globals (`describe`, `it`, `vi`, `expect`) come from Vitest.

## 1. Pure helper (type-guard parsing)

```ts
// src/features/orders/lib/__tests__/<name>.spec.ts
import {
  DEFAULT_ORDER_LIST_FILTERS,
  orderListFiltersFromSearchParams,
} from '@/features/orders/lib/order-list-filters';

describe('orderListFiltersFromSearchParams', () => {
  it('returns the defaults for an empty query string', () => {
    expect(orderListFiltersFromSearchParams(new URLSearchParams())).toEqual(
      DEFAULT_ORDER_LIST_FILTERS,
    );
  });

  it.each([
    ['status=shipped', { status: 'shipped' }],
    ['sortBy=totalPrice&sortOrder=asc', { sortBy: 'totalPrice', sortOrder: 'asc' }],
    ['page=3&limit=20', { page: 3, limit: 20 }],
  ])('parses %s', (query, expected) => {
    expect(
      orderListFiltersFromSearchParams(new URLSearchParams(query)),
    ).toMatchObject(expected);
  });

  it('drops values outside the contract', () => {
    const filters = orderListFiltersFromSearchParams(
      new URLSearchParams('status=bogus&sortBy=nope&sortOrder=sideways'),
    );

    expect(filters.status).toBeUndefined();
    expect(filters.sortBy).toBe(DEFAULT_ORDER_LIST_FILTERS.sortBy);
    expect(filters.sortOrder).toBe(DEFAULT_ORDER_LIST_FILTERS.sortOrder);
  });
});
```

## 2. Zod schema

`safeParse` returns a union. Assert the whole shape with `toMatchObject`; never branch on `result.success`.

```ts
// src/features/products/schemas/__tests__/<name>.spec.ts
import { createProductSchema } from '@/features/products/schemas/product-schema';

const validForm = {
  name: 'Laptop',
  price: '10',
  currency: 'USD',
  categoryId: '2',
};

describe('createProductSchema', () => {
  it('accepts a minimal valid form', () => {
    expect(createProductSchema.safeParse(validForm)).toMatchObject({
      success: true,
      data: { name: 'Laptop', price: '10' },
    });
  });

  it('rejects a missing category and reports the field', () => {
    expect(
      createProductSchema.safeParse({ ...validForm, categoryId: '' }),
    ).toMatchObject({
      success: false,
      error: {
        issues: expect.arrayContaining([
          expect.objectContaining({ path: ['categoryId'] }),
        ]),
      },
    });
  });

  it.each(['0', '-5', 'abc'])('rejects price %s', (price) => {
    expect(
      createProductSchema.safeParse({ ...validForm, price }),
    ).toMatchObject({ success: false });
  });
});
```

## 3. API wrapper (mock the generated client)

Mock `@/lib/api/client`, return the `{ data, error, response }` triple the wrapper reads, and assert the wrapper's contract: the returned DTO or the thrown `ApiRequestError`.

```ts
// src/features/products/api/__tests__/<name>.spec.ts
import { getProductRequest } from '@/features/products/api/products-api';
import type { ProductDetailResponseDto } from '@/features/products/types';

// Untyped on purpose: only for the generated client (see SKILL.md, typed mocks, item 6).
const get = vi.hoisted(() => vi.fn());

vi.mock('@/lib/api/client', () => ({
  apiClient: { GET: get },
}));

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

describe('getProductRequest', () => {
  beforeEach(() => {
    get.mockReset();
  });

  it('returns the product on 200', async () => {
    const product = {
      id: 7,
      name: 'Laptop',
      slug: 'laptop',
      sku: 'LAP-7',
      price: 1200,
      currency: 'USD',
      isActive: true,
      createdAt: '2026-01-01T00:00:00.000Z',
      updatedAt: '2026-01-01T00:00:00.000Z',
    } satisfies ProductDetailResponseDto;
    get.mockResolvedValue({
      data: product,
      error: undefined,
      response: jsonResponse(product, 200),
    });

    await expect(getProductRequest(7)).resolves.toEqual(product);
    expect(get).toHaveBeenCalledWith('/v1/products/{id}', {
      params: { path: { id: 7 } },
    });
  });

  it('throws an ApiRequestError carrying the API status and message on 404', async () => {
    const body = { statusCode: 404, message: 'Product not found' };
    get.mockResolvedValue({
      data: undefined,
      error: body,
      response: jsonResponse(body, 404),
    });

    await expect(getProductRequest(7)).rejects.toMatchObject({
      name: 'ApiRequestError',
      statusCode: 404,
      message: 'Product not found',
    });
  });
});
```

## 4. Query or mutation hook (real QueryClient, mocked API module)

Automock the API module so every export is a `vi.fn()`, then use `vi.mocked(fn)`: it keeps the real signature, so `mockResolvedValue` is type-checked. Assert cache effects through the `QueryClient`, not through internals.

```tsx
// src/features/products/hooks/__tests__/<name>.spec.tsx
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react';
import { deleteProductRequest } from '@/features/products/api/products-api';
import { productKeys } from '@/features/products/hooks/product-keys';
import { useDeleteProduct } from '@/features/products/hooks/use-products';
import { dashboardKeys } from '@/lib/query-keys/dashboard-keys';

vi.mock('@/features/products/api/products-api');

function setup() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const invalidate = vi.spyOn(queryClient, 'invalidateQueries');
  const remove = vi.spyOn(queryClient, 'removeQueries');
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  return { invalidate, remove, wrapper };
}

describe('useDeleteProduct', () => {
  it('refreshes lists and dashboard and drops the deleted detail', async () => {
    vi.mocked(deleteProductRequest).mockResolvedValue(undefined);
    const { invalidate, remove, wrapper } = setup();
    const { result } = renderHook(() => useDeleteProduct(7), { wrapper });

    await act(async () => {
      await result.current.mutateAsync();
    });

    expect(deleteProductRequest).toHaveBeenCalledWith(7);
    expect(invalidate).toHaveBeenCalledWith({ queryKey: productKeys.lists() });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: dashboardKeys.all });
    expect(remove).toHaveBeenCalledWith({ queryKey: productKeys.detail(7) });
  });

  it('leaves the cache alone when the request fails', async () => {
    vi.mocked(deleteProductRequest).mockRejectedValue(new Error('boom'));
    const { invalidate, wrapper } = setup();
    const { result } = renderHook(() => useDeleteProduct(7), { wrapper });

    await act(async () => {
      await result.current.mutateAsync().catch(() => undefined);
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(invalidate).not.toHaveBeenCalled();
  });
});
```

## 5. Presentational component (callback props, user events)

Prefer props and callbacks over mocks. Type the stubs with the prop's own signature.

```tsx
// src/features/products/components/__tests__/<name>.spec.tsx
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProductStatusActions } from '@/features/products/components/product-status-actions';
import { ApiRequestError } from '@/lib/api/parse-api-error';

describe('ProductStatusActions', () => {
  it('confirms before deactivating an active product', async () => {
    const user = userEvent.setup();
    const onDeactivate = vi.fn<() => Promise<void>>().mockResolvedValue();

    render(
      <ProductStatusActions
        isActive
        isPending={false}
        onActivate={vi.fn<() => Promise<void>>()}
        onDeactivate={onDeactivate}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Deactivate product' }));
    expect(onDeactivate).not.toHaveBeenCalled();

    const dialog = screen.getByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: 'Deactivate' }));

    expect(onDeactivate).toHaveBeenCalledTimes(1);
  });

  it('shows the API message when activation fails', async () => {
    const user = userEvent.setup();
    const onActivate = vi
      .fn<() => Promise<void>>()
      .mockRejectedValue(
        new ApiRequestError({ statusCode: 409, message: 'Product was changed' }),
      );

    render(
      <ProductStatusActions
        isActive={false}
        isPending={false}
        onActivate={onActivate}
        onDeactivate={vi.fn<() => Promise<void>>()}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Activate product' }));

    expect(await screen.findByText('Product was changed')).toBeInTheDocument();
  });
});
```

## 6. Page with a mocked query hook

Mock the hook module with a factory. Type the hook's return as a `Pick` of the real `ReturnType`, so the stub breaks when the hook's shape changes. No `QueryClientProvider`.

```tsx
// src/features/orders/pages/__tests__/<name>.spec.tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';
import type { useOrdersListQuery } from '@/features/orders/hooks/use-orders';
import { OrdersPage } from '@/features/orders/pages/orders-page';
import type { PaginatedOrdersResponseDto } from '@/features/orders/types';
import { ApiRequestError } from '@/lib/api/parse-api-error';

type ListQuery = Pick<
  ReturnType<typeof useOrdersListQuery>,
  'data' | 'isLoading' | 'isError' | 'error' | 'refetch' | 'isFetching'
>;

const listQuery = vi.hoisted(() => vi.fn<() => ListQuery>());

vi.mock('@/features/orders/hooks/use-orders', () => ({
  useOrdersListQuery: listQuery,
}));

const emptyPage = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
} satisfies PaginatedOrdersResponseDto;

function renderPage() {
  return render(
    <MemoryRouter>
      <OrdersPage />
    </MemoryRouter>,
  );
}

describe('OrdersPage', () => {
  it('shows the empty state when there are no orders', () => {
    listQuery.mockReturnValue({
      data: emptyPage,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    });

    renderPage();

    expect(screen.getByRole('heading', { name: 'Orders' })).toBeInTheDocument();
    expect(screen.getByText('No orders found.')).toBeInTheDocument();
  });

  it('shows the API error and retries on click', async () => {
    const user = userEvent.setup();
    const refetch = vi.fn<ListQuery['refetch']>();
    listQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new ApiRequestError({ statusCode: 500, message: 'Server down' }),
      refetch,
      isFetching: false,
    });

    renderPage();

    expect(screen.getByText('Could not load orders')).toBeInTheDocument();
    expect(screen.getByText('Server down')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Retry' }));

    expect(refetch).toHaveBeenCalledTimes(1);
  });
});
```

## 7. Route guard with mocked auth

Derive the stub's type from the real context, and set it per test. Both branches get their own `it`; neither is conditional.

```tsx
// src/lib/auth/__tests__/<name>.spec.tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import type { useAuth } from '@/lib/auth/auth-context';
import { PermissionRoute } from '@/lib/auth/permission-route';

const hasPermission = vi.hoisted(() =>
  vi.fn<ReturnType<typeof useAuth>['hasPermission']>(),
);

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({ hasPermission }),
}));

function renderGuard() {
  return render(
    <MemoryRouter>
      <PermissionRoute permission="manage_roles">
        <p>Restricted content</p>
      </PermissionRoute>
    </MemoryRouter>,
  );
}

describe('PermissionRoute', () => {
  it('renders the forbidden page without the permission', () => {
    hasPermission.mockReturnValue(false);

    renderGuard();

    expect(screen.getByRole('heading', { name: 'Access denied' })).toBeInTheDocument();
    expect(screen.queryByText('Restricted content')).not.toBeInTheDocument();
    expect(hasPermission).toHaveBeenCalledWith('manage_roles');
  });

  it('renders the children with the permission', () => {
    hasPermission.mockReturnValue(true);

    renderGuard();

    expect(screen.getByText('Restricted content')).toBeInTheDocument();
  });
});
```
