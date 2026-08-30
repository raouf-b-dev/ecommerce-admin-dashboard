import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router';
import { ChangePasswordPage } from '@/features/auth/pages/change-password-page';

const mockLogout = vi.fn();

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({
    session: {
      email: 'admin@store.local',
      mustChangePassword: true,
    },
    logout: mockLogout,
    changePassword: vi.fn(),
  }),
}));

describe('ChangePasswordPage', () => {
  beforeEach(() => {
    mockLogout.mockReset();
    mockLogout.mockResolvedValue(undefined);
  });

  it('shows the signed-in email and a Sign out control', () => {
    render(
      <MemoryRouter>
        <ChangePasswordPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Change your password' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Signed in as admin@store.local')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });

  it('signs out and returns to login', async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={['/change-password']}>
        <Routes>
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/login" element={<div>Login form</div>} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole('button', { name: 'Sign out' }));

    expect(mockLogout).toHaveBeenCalled();
    expect(await screen.findByText('Login form')).toBeInTheDocument();
  });
});
