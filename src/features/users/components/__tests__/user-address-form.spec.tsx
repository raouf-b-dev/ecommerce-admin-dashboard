import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { UserAddressForm } from '@/features/users/components/user-address-form';
import { emptyAddressFormValues } from '@/features/users/schemas/address-schema';
import { ApiRequestError } from '@/lib/api/parse-api-error';

describe('UserAddressForm', () => {
  it('submits add values including isDefault', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <UserAddressForm
        mode="add"
        open
        isPending={false}
        defaultValues={emptyAddressFormValues}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.change(screen.getByLabelText('Street'), {
      target: { value: '10 Integration Way' },
    });
    fireEvent.change(screen.getByLabelText('City'), {
      target: { value: 'Algiers' },
    });
    fireEvent.change(screen.getByLabelText('State'), {
      target: { value: 'Algiers' },
    });
    fireEvent.change(screen.getByLabelText('Postal code'), {
      target: { value: '16000' },
    });
    fireEvent.change(screen.getByLabelText('Country'), {
      target: { value: 'DZ' },
    });
    fireEvent.click(screen.getByLabelText('Set as default address'));
    fireEvent.click(screen.getByRole('button', { name: 'Add address' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        street: '10 Integration Way',
        city: 'Algiers',
        state: 'Algiers',
        postalCode: '16000',
        country: 'DZ',
        isDefault: true,
      }),
    );
  });

  it('hides the default checkbox in edit mode', () => {
    render(
      <UserAddressForm
        mode="edit"
        open
        isPending={false}
        defaultValues={{
          ...emptyAddressFormValues,
          street: '100 Main Street',
          city: 'San Francisco',
          state: 'CA',
          postalCode: '94103',
          country: 'USA',
        }}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    expect(
      screen.queryByLabelText('Set as default address'),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Save address' })).toBeInTheDocument();
  });

  it('shows a validation error when street is empty', async () => {
    render(
      <UserAddressForm
        mode="add"
        open
        isPending={false}
        onOpenChange={vi.fn()}
        onSubmit={vi.fn()}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add address' }));

    expect(await screen.findByText('Street is required')).toBeInTheDocument();
  });

  it('shows the API message when add fails', async () => {
    const onSubmit = vi.fn().mockRejectedValue(
      new ApiRequestError({
        statusCode: 400,
        message: 'Street is too short',
      }),
    );

    render(
      <UserAddressForm
        mode="add"
        open
        isPending={false}
        defaultValues={{
          ...emptyAddressFormValues,
          street: '10 Integration Way',
          city: 'Algiers',
          state: 'Algiers',
          postalCode: '16000',
          country: 'DZ',
        }}
        onOpenChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Add address' }));

    expect(await screen.findByText('Street is too short')).toBeInTheDocument();
    expect(screen.getByText('Could not save address')).toBeInTheDocument();
  });
});
