import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { UserAddressList } from '@/features/users/components/user-address-list';
import { ApiRequestError } from '@/lib/api/parse-api-error';
import type { AddressResponseDto } from '@/features/users/types';

const defaultAddress: AddressResponseDto = {
  id: 1,
  street: '100 Main Street',
  street2: 'Apartment 2B',
  city: 'San Francisco',
  state: 'CA',
  postalCode: '94103',
  country: 'USA',
  type: 'HOME',
  isDefault: true,
  deliveryInstructions: 'Leave packages at front door.',
  createdAt: '2025-10-31T10:00:00.000Z',
  updatedAt: '2025-10-31T12:00:00.000Z',
};

const otherAddress: AddressResponseDto = {
  ...defaultAddress,
  id: 2,
  street: '200 Oak Ave',
  street2: undefined,
  isDefault: false,
  deliveryInstructions: undefined,
};

describe('UserAddressList', () => {
  it('shows an empty state when there are no addresses', () => {
    render(
      <UserAddressList
        addresses={[]}
        canManage={false}
        isPending={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onSetDefault={vi.fn()}
      />,
    );

    expect(screen.getByText('No addresses on file.')).toBeInTheDocument();
  });

  it('shows a default badge and hides write actions for viewers', () => {
    render(
      <UserAddressList
        addresses={[defaultAddress]}
        canManage={false}
        isPending={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onSetDefault={vi.fn()}
      />,
    );

    expect(screen.getByText('100 Main Street')).toBeInTheDocument();
    expect(screen.getByText('Default')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Set default' }),
    ).not.toBeInTheDocument();
  });

  it('disables Set default on the current default address', () => {
    render(
      <UserAddressList
        addresses={[defaultAddress, otherAddress]}
        canManage
        isPending={false}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
        onSetDefault={vi.fn()}
      />,
    );

    const setDefaultButtons = screen.getAllByRole('button', {
      name: 'Set default',
    });
    expect(setDefaultButtons[0]).toBeDisabled();
    expect(setDefaultButtons[1]).toBeEnabled();
  });

  it('asks to confirm before deleting an address', async () => {
    const onDelete = vi.fn().mockResolvedValue(undefined);

    render(
      <UserAddressList
        addresses={[defaultAddress]}
        canManage
        isPending={false}
        onEdit={vi.fn()}
        onDelete={onDelete}
        onSetDefault={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).getByText('Remove 100 Main Street from this account?'),
    ).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith(1);
    });
  });

  it('shows the API message when delete fails', async () => {
    const onDelete = vi.fn().mockRejectedValue(
      new ApiRequestError({
        statusCode: 403,
        message: 'Forbidden',
      }),
    );

    render(
      <UserAddressList
        addresses={[defaultAddress]}
        canManage
        isPending={false}
        onEdit={vi.fn()}
        onDelete={onDelete}
        onSetDefault={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    fireEvent.click(
      within(screen.getByRole('dialog')).getByRole('button', { name: 'Delete' }),
    );

    expect(await screen.findByText('Forbidden')).toBeInTheDocument();
    expect(screen.getByText('Action failed')).toBeInTheDocument();
  });
});
