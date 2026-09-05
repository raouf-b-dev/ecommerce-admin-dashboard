import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

    expect(
      await screen.findByRole('heading', { name: 'Create category' }),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Toys' },
    });

    const submitButtons = screen.getAllByRole('button', {
      name: 'Create category',
    });
    fireEvent.click(submitButtons[submitButtons.length - 1]);

    await waitFor(() => {
      expect(createMutate).toHaveBeenCalledWith({ name: 'Toys' });
    });
  });

  it('warns that delete unassigns products before confirming', async () => {
    renderPage();

    fireEvent.click(screen.getAllByRole('button', { name: 'Delete' })[0]);

    expect(
      await screen.findByRole('heading', { name: 'Delete category' }),
    ).toBeInTheDocument();
    expect(screen.getByText(/become unassigned/i)).toBeInTheDocument();
    expect(screen.getByText(/cannot be activated/i)).toBeInTheDocument();
    expect(screen.getByText(/recategorized/i)).toBeInTheDocument();

    const deleteButtons = screen.getAllByRole('button', { name: 'Delete' });
    fireEvent.click(deleteButtons[deleteButtons.length - 1]);

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
