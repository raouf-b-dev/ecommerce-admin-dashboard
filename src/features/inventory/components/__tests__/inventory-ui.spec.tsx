import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AdjustStockDialog } from '@/features/inventory/components/adjust-stock-dialog';

describe('AdjustStockDialog', () => {
  it('shows validation errors for empty quantity', async () => {
    const onSubmit = vi.fn();

    render(
      <AdjustStockDialog
        open
        onOpenChange={vi.fn()}
        productTitle="Wireless Headphones"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Apply adjustment' }));

    expect(
      await screen.findByText('Quantity is required'),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits mapped DTO on valid input', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <AdjustStockDialog
        open
        onOpenChange={vi.fn()}
        productTitle="Wireless Headphones"
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText('Quantity'), {
      target: { value: '10' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Apply adjustment' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        type: 'ADD',
        quantity: 10,
      });
    });
  });

  it('closes on Escape', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();

    render(
      <AdjustStockDialog
        open
        onOpenChange={onOpenChange}
        productTitle="Wireless Headphones"
        onSubmit={vi.fn()}
      />,
    );

    await user.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
