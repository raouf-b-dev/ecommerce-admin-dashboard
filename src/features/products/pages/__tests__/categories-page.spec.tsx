import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { CategoriesPage } from '@/features/products/pages/categories-page';

const sampleCategories = [
  {
    id: 1,
    name: 'Electronics',
    slug: 'electronics',
    description: null,
    isActive: true,
  },
  {
    id: 5,
    name: 'Books',
    slug: 'books',
    description: null,
    isActive: false,
  },
];

const listQueryMock = vi.hoisted(() =>
  vi.fn(() => ({
    data: sampleCategories,
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: vi.fn(),
  })),
);

const createMutate = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const updateMutate = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const deleteMutate = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const activateMutate = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));
const deactivateMutate = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

const authMock = vi.hoisted(() =>
  vi.fn(() => ({
    hasPermission: (permission: string) =>
      permission === 'view_all_products' || permission === 'manage_products',
  })),
);

vi.mock('@/features/products/hooks/use-categories', () => ({
  useCategoriesListQuery: () => listQueryMock(),
  useCreateCategory: () => ({
    mutateAsync: createMutate,
    isPending: false,
  }),
  useUpdateCategory: () => ({
    mutateAsync: updateMutate,
    isPending: false,
  }),
  useDeleteCategory: () => ({
    mutateAsync: deleteMutate,
    isPending: false,
  }),
  useActivateCategory: () => ({
    mutateAsync: activateMutate,
    isPending: false,
  }),
  useDeactivateCategory: () => ({
    mutateAsync: deactivateMutate,
    isPending: false,
  }),
}));

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => authMock(),
}));

function renderPage() {
  return render(
    <MemoryRouter>
      <CategoriesPage />
    </MemoryRouter>,
  );
}

describe('CategoriesPage', () => {
  beforeEach(() => {
    createMutate.mockClear();
    updateMutate.mockClear();
    deleteMutate.mockClear();
    activateMutate.mockClear();
    deactivateMutate.mockClear();
    authMock.mockReturnValue({
      hasPermission: (permission: string) =>
        permission === 'view_all_products' || permission === 'manage_products',
    });
    listQueryMock.mockReturnValue({
      data: sampleCategories,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
  });

  it('loads the category list', () => {
    renderPage();

    expect(
      screen.getByRole('heading', { name: 'Categories' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(screen.getByText('Books')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Create category' }),
    ).toBeInTheDocument();
  });

  it('creates a category from the dialog', async () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Create category' }));

    const dialog = await screen.findByRole('dialog', {
      name: 'Create category',
    });
    expect(dialog).toBeInTheDocument();

    fireEvent.change(within(dialog).getByLabelText('Name'), {
      target: { value: 'Toys' },
    });

    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Create category' }),
    );

    await waitFor(() => {
      expect(createMutate).toHaveBeenCalledWith({ name: 'Toys' });
    });
  });

  it('warns that delete unassigns products before confirming', async () => {
    renderPage();

    const row = screen.getByRole('row', { name: /electronics/i });
    fireEvent.click(within(row).getByRole('button', { name: 'Delete' }));

    const dialog = await screen.findByRole('dialog', {
      name: 'Delete category',
    });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByText(/become unassigned/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/cannot be activated/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/recategorized/i)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(deleteMutate).toHaveBeenCalledWith(1);
    });
  });

  it('hides write actions when manage_products is missing', () => {
    authMock.mockReturnValue({
      hasPermission: (permission: string) =>
        permission === 'view_all_products',
    });

    renderPage();

    expect(screen.getByText('Electronics')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Create category' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Activate' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Deactivate' }),
    ).not.toBeInTheDocument();
  });
});
