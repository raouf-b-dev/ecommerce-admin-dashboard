import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProductForm } from '@/features/products/components/product-form';
import { ApiRequestError } from '@/lib/api/parse-api-error';

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
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows conflict banner when conflictMessage is set', () => {
    render(
      <ProductForm
        mode="edit"
        submitLabel="Save changes"
        conflictMessage="This product was modified by another request."
        defaultValues={{ name: 'Laptop', price: '10', currency: 'USD' }}
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
        defaultValues={{ name: 'Laptop', price: '10', currency: 'USD' }}
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
