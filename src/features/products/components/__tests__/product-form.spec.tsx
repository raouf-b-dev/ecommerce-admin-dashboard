import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductForm } from '@/features/products/components/product-form';
import { ApiRequestError } from '@/lib/api/parse-api-error';

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

vi.mock('@/features/products/hooks/use-categories', () => ({
  useCategoriesListQuery: categoriesQueryMock,
}));

describe('ProductForm', () => {
  it('shows validation errors for empty create submit', async () => {
    const onSubmit = vi.fn();

    render(
      <ProductForm
        mode="create"
        submitLabel="Create product"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Create product' }));

    expect(await screen.findByText('Name is required')).toBeInTheDocument();
    expect(await screen.findByText('Category is required')).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits create payload with required categoryId', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ProductForm
        mode="create"
        submitLabel="Create product"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText('Name'), {
      target: { value: 'Laptop' },
    });
    fireEvent.change(screen.getByLabelText('Price'), {
      target: { value: '10' },
    });
    fireEvent.change(screen.getByLabelText('Currency'), {
      target: { value: 'USD' },
    });
    fireEvent.change(screen.getByLabelText('Category'), {
      target: { value: '2' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Create product' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Laptop',
          price: 10,
          categoryId: 2,
        }),
      );
    });
  });

  it('shows conflict banner when conflictMessage is set', () => {
    render(
      <ProductForm
        mode="edit"
        submitLabel="Save changes"
        conflictMessage="This product was modified by another request."
        defaultValues={{
          name: 'Laptop',
          price: '10',
          currency: 'USD',
          categoryId: '1',
        }}
        onSubmit={vi.fn()}
      />,
    );

    expect(
      screen.getByText('Product was updated elsewhere'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('This product was modified by another request.'),
    ).toBeInTheDocument();
  });

  it('does not treat 409 as a generic form error', async () => {
    const onSubmit = vi.fn().mockRejectedValue(
      new ApiRequestError({
        statusCode: 409,
        message:
          'Resource was modified by another request. Please reload and retry.',
        code: 'OPTIMISTIC_LOCK_CONFLICT',
      }),
    );

    render(
      <ProductForm
        mode="edit"
        submitLabel="Save changes"
        defaultValues={{
          name: 'Laptop',
          price: '10',
          currency: 'USD',
          categoryId: '1',
        }}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalled();
    });

    expect(screen.queryByText('Could not save product')).not.toBeInTheDocument();
    expect(
      screen.queryByText(
        'Resource was modified by another request. Please reload and retry.',
      ),
    ).not.toBeInTheDocument();
  });
});
