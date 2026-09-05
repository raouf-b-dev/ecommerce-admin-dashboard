import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ProductsPage } from '@/features/products/pages/products-page';

type ListQueryResult = {
  data:
    | {
        items: unknown[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }
    | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: ReturnType<typeof vi.fn>;
  isFetching: boolean;
};

const listQueryMock = vi.hoisted(() =>
  vi.fn((): ListQueryResult => ({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    isFetching: false,
  })),
);

const authMock = vi.hoisted(() =>
  vi.fn(() => ({
    hasPermission: (permission?: string): boolean =>
      permission === 'manage_products',
  })),
);

const categoriesQueryMock = vi.hoisted(() =>
  vi.fn(() => ({
    data: [
      { id: 1, name: 'Electronics', slug: 'electronics', description: null, isActive: true },
      { id: 2, name: 'Clothing', slug: 'clothing', description: null, isActive: true },
      { id: 3, name: 'Home & Garden', slug: 'home-garden', description: null, isActive: true },
      { id: 4, name: 'Sports', slug: 'sports', description: null, isActive: true },
      { id: 5, name: 'Books', slug: 'books', description: null, isActive: true },
    ],
    isLoading: false,
    isError: false,
    error: null,
  })),
);

vi.mock('@/features/products/hooks/use-products', () => ({
  useProductsListQuery: listQueryMock,
}));

vi.mock('@/features/products/hooks/use-categories', () => ({
  useCategoriesListQuery: categoriesQueryMock,
}));

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => authMock(),
}));

describe('ProductsPage', () => {
  beforeEach(() => {
    listQueryMock.mockReset();
    authMock.mockReturnValue({
      hasPermission: (permission?: string) =>
        permission === 'manage_products',
    });
  });

  it('shows empty table message when there are no items', () => {
    listQueryMock.mockReturnValue({
      data: { items: [], total: 0, page: 1, limit: 10, totalPages: 0 },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    });

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Products' })).toBeInTheDocument();
    expect(screen.getByText('No products found.')).toBeInTheDocument();
    expect(
      screen.getByRole('link', { name: 'Manage categories' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'New product' })).toBeInTheDocument();
  });

  it('shows Manage categories when manage_products is missing', () => {
    authMock.mockReturnValue({
      hasPermission: () => false,
    });
    listQueryMock.mockReturnValue({
      data: { items: [], total: 0, page: 1, limit: 10, totalPages: 0 },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    });

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('link', { name: 'Manage categories' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'New product' }),
    ).not.toBeInTheDocument();
  });

  it('shows error alert with retry when the query fails', () => {
    const refetch = vi.fn();
    listQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Network down'),
      refetch,
      isFetching: false,
    });

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Could not load products')).toBeInTheDocument();
    expect(screen.getByText('Network down')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalled();
  });

  it('shows a soft refresh warning when data is still available', () => {
    const refetch = vi.fn();
    listQueryMock.mockReturnValue({
      data: {
        items: [
          {
            id: 1,
            name: 'Laptop',
            sku: 'SKU-1',
            price: 10,
            currency: 'USD',
            isActive: true,
            createdAt: '2025-01-01T00:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
      isLoading: false,
      isError: true,
      error: new Error('Too many requests. Wait a moment and try again.'),
      refetch,
      isFetching: false,
    });

    render(
      <MemoryRouter>
        <ProductsPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Could not refresh products')).toBeInTheDocument();
    expect(
      screen.getByText('Too many requests. Wait a moment and try again.'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Could not load products')).not.toBeInTheDocument();
  });
});
