import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import { UserRoleActions } from '@/features/users/components/user-role-actions';

const roles = [
  { code: 'CUSTOMER', name: 'Customer' },
  { code: 'ADMIN', name: 'Administrator' },
];

describe('UserRoleActions', () => {
  it('disables Change role when the current role is still selected', () => {
    render(
      <UserRoleActions
        currentRoleCode="CUSTOMER"
        roles={roles}
        rolesLoading={false}
        isPending={false}
        onAssign={vi.fn()}
      />,
    );

    expect(screen.getByLabelText('Assigned role')).toHaveValue('CUSTOMER');
    expect(screen.getByRole('button', { name: 'Change role' })).toBeDisabled();
  });

  it('confirms then assigns the selected role', async () => {
    const onAssign = vi.fn().mockResolvedValue(undefined);

    render(
      <UserRoleActions
        currentRoleCode="CUSTOMER"
        roles={roles}
        rolesLoading={false}
        isPending={false}
        onAssign={onAssign}
      />,
    );

    fireEvent.change(screen.getByLabelText('Assigned role'), {
      target: { value: 'ADMIN' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Change role' }));

    const dialog = screen.getByRole('dialog');
    expect(
      within(dialog).getByText(
        'This replaces the current role with Administrator (ADMIN).',
      ),
    ).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: 'Change role' }));

    await waitFor(() => {
      expect(onAssign).toHaveBeenCalledWith('ADMIN');
    });
  });
});
