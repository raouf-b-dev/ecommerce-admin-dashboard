import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { ChangePasswordForm } from '@/features/auth/components/change-password-form';
import { AuthRequestError } from '@/features/auth/api/parse-auth-error';

const mockChangePassword = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({
    changePassword: mockChangePassword,
  }),
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams('redirect=%2F')],
  };
});

describe('ChangePasswordForm', () => {
  afterEach(() => {
    mockChangePassword.mockReset();
    mockNavigate.mockReset();
  });

  it('shows validation errors for mismatched confirm password', async () => {
    render(
      <MemoryRouter>
        <ChangePasswordForm />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Current password'), {
      target: { value: 'Admin123!' },
    });
    fireEvent.change(screen.getByLabelText('New password'), {
      target: { value: 'NewPass123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirm new password'), {
      target: { value: 'Different123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));

    expect(
      await screen.findByText('Passwords do not match'),
    ).toBeInTheDocument();
  });

  it('navigates home after successful change', async () => {
    mockChangePassword.mockResolvedValue({
      userId: '1',
      email: 'admin@store.local',
      role: 'ADMIN',
      permissions: [],
      mustChangePassword: false,
    });

    render(
      <MemoryRouter>
        <ChangePasswordForm />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Current password'), {
      target: { value: 'Admin123!' },
    });
    fireEvent.change(screen.getByLabelText('New password'), {
      target: { value: 'NewPass123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirm new password'), {
      target: { value: 'NewPass123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  it('shows incorrect-current-password message on 401', async () => {
    mockChangePassword.mockRejectedValue(
      new AuthRequestError({
        statusCode: 401,
        message: 'Current password is incorrect',
      }),
    );

    render(
      <MemoryRouter>
        <ChangePasswordForm />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Current password'), {
      target: { value: 'wrong' },
    });
    fireEvent.change(screen.getByLabelText('New password'), {
      target: { value: 'NewPass123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirm new password'), {
      target: { value: 'NewPass123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));

    expect(
      await screen.findByText('Current password is incorrect.'),
    ).toBeInTheDocument();
  });

  it('shows API validation message on 400', async () => {
    mockChangePassword.mockRejectedValue(
      new AuthRequestError({
        statusCode: 400,
        message: 'New password must differ from current password',
      }),
    );

    render(
      <MemoryRouter>
        <ChangePasswordForm />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Current password'), {
      target: { value: 'Admin123!' },
    });
    fireEvent.change(screen.getByLabelText('New password'), {
      target: { value: 'Admin123!' },
    });
    fireEvent.change(screen.getByLabelText('Confirm new password'), {
      target: { value: 'Admin123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Update password' }));

    expect(
      await screen.findByText('New password must differ from current password'),
    ).toBeInTheDocument();
  });
});
