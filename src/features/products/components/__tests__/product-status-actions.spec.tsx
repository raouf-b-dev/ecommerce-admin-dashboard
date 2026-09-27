import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { ProductStatusActions } from '@/features/products/components/product-status-actions';
import { ApiRequestError } from '@/lib/api/parse-api-error';

describe('ProductStatusActions', () => {
  it('asks to confirm before deactivating an active product', async () => {
    const onDeactivate = vi.fn().mockResolvedValue(undefined);

    render(
      <ProductStatusActions
        isActive
        isPending={false}
        onActivate={vi.fn()}
        onDeactivate={onDeactivate}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Deactivate product' }));

    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).getByText(
        'The product will be hidden from the catalog until reactivated.',
      ),
    ).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Deactivate' }));

    await waitFor(() => {
      expect(onDeactivate).toHaveBeenCalledTimes(1);
    });
  });

  it('activates an inactive product without a confirm dialog', async () => {
    const onActivate = vi.fn().mockResolvedValue(undefined);

    render(
      <ProductStatusActions
        isActive={false}
        isPending={false}
        onActivate={onActivate}
        onDeactivate={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Activate product' }));

    await waitFor(() => {
      expect(onActivate).toHaveBeenCalledTimes(1);
    });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows the API message when deactivate returns already inactive', async () => {
    const onDeactivate = vi.fn().mockRejectedValue(
      new ApiRequestError({
        statusCode: 400,
        message: 'Product is already inactive',
      }),
    );

    render(
      <ProductStatusActions
        isActive
        isPending={false}
        onActivate={vi.fn()}
        onDeactivate={onDeactivate}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Deactivate product' }));
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', {
        name: 'Deactivate',
      }),
    );

    expect(await screen.findByText('Product is already inactive')).toBeInTheDocument();
    expect(screen.getByText('Action failed')).toBeInTheDocument();
  });

  it('shows the API message on 409 without using the form conflict banner', async () => {
    const onActivate = vi.fn().mockRejectedValue(
      new ApiRequestError({
        statusCode: 409,
        message:
          'Resource was modified by another request. Please reload and retry.',
        code: 'OPTIMISTIC_LOCK_CONFLICT',
      }),
    );

    render(
      <ProductStatusActions
        isActive={false}
        isPending={false}
        onActivate={onActivate}
        onDeactivate={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Activate product' }));

    expect(
      await screen.findByText(
        'Resource was modified by another request. Please reload and retry.',
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByText('Product was updated elsewhere'),
    ).not.toBeInTheDocument();
  });
});
