import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { ProductEditPage } from '@/features/products/pages/product-edit-page';

type ProductQueryResult = {
  data:
    | {
        id: number;
        name: string;
        slug: string;
        sku: string;
        price: number;
        currency: string;
        isActive: boolean;
        createdAt: string;
        updatedAt: string;
        description?: string | null;
        imageUrl?: string | null;
        categoryId?: number | null;
      }
    | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: ReturnType<typeof vi.fn>;
};

const productQueryMock = vi.hoisted(() =>
  vi.fn((): ProductQueryResult => ({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })),
);

const authMock = vi.hoisted(() =>
  vi.fn(() => ({
    hasPermission: ((permission: string) =>
      permission === 'manage_products') as (permission: string) => boolean,
  })),
);

vi.mock('@/features/products/hooks/use-products', () => ({
  useProductQuery: productQueryMock,
  useUpdateProduct: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useDeleteProduct: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useActivateProduct: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useDeactivateProduct: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => authMock(),
}));

const loadedProduct = {
  id: 1,
  name: 'Laptop',
  slug: 'laptop',
  sku: 'SKU-1',
  price: 10,
  currency: 'USD',
  isActive: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-02T00:00:00.000Z',
  description: null,
  imageUrl: null,
  categoryId: null,
};

function renderEditPage() {
  return render(
    <MemoryRouter initialEntries={['/products/1/edit']}>
      <Routes>
        <Route path="/products/:id/edit" element={<ProductEditPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProductEditPage', () => {
  beforeEach(() => {
    productQueryMock.mockReset();
    authMock.mockReturnValue({
      hasPermission: ((permission: string) =>
        permission === 'manage_products') as (permission: string) => boolean,
    });
    productQueryMock.mockReturnValue({
      data: loadedProduct,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('shows catalog status actions when manage_products is granted', () => {
    renderEditPage();

    expect(
      screen.getByRole('heading', { name: 'Edit product' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Catalog status' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Deactivate product' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Delete product' }),
    ).toBeInTheDocument();
  });

  it('hides catalog status actions when manage_products is missing', () => {
    authMock.mockReturnValue({
      hasPermission: (() => false) as (permission: string) => boolean,
    });

    renderEditPage();

    expect(
      screen.getByRole('heading', { name: 'Edit product' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: 'Catalog status' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Deactivate product' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete product' }),
    ).not.toBeInTheDocument();
  });
});
