import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import {
  ChangePasswordRoute,
  RequirePasswordChanged,
} from '@/lib/auth/must-change-password-route';

const mockUseAuth = vi.fn();

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('RequirePasswordChanged', () => {
  afterEach(() => {
    mockUseAuth.mockReset();
  });

  it('redirects to change-password when flag is set', () => {
    mockUseAuth.mockReturnValue({
      session: { mustChangePassword: true },
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <RequirePasswordChanged>
                <div>Dashboard</div>
              </RequirePasswordChanged>
            }
          />
          <Route path="/change-password" element={<div>Change password</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Change password')).toBeInTheDocument();
  });

  it('renders children when flag is cleared', () => {
    mockUseAuth.mockReturnValue({
      session: { mustChangePassword: false },
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route
            path="/"
            element={
              <RequirePasswordChanged>
                <div>Dashboard</div>
              </RequirePasswordChanged>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});

describe('ChangePasswordRoute', () => {
  afterEach(() => {
    mockUseAuth.mockReset();
  });

  it('redirects away when password change is not required', () => {
    mockUseAuth.mockReturnValue({
      session: { mustChangePassword: false },
    });

    render(
      <MemoryRouter initialEntries={['/change-password']}>
        <Routes>
          <Route path="/" element={<div>Dashboard</div>} />
          <Route
            path="/change-password"
            element={
              <ChangePasswordRoute>
                <div>Change form</div>
              </ChangePasswordRoute>
            }
          />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });
});
