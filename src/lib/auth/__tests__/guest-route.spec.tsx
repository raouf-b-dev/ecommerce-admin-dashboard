import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { GuestRoute } from '@/lib/auth/guest-route';

const mockUseAuth = vi.fn();

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

function renderGuestRoute(initialEntry: string) {
  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <Routes>
        <Route
          path="/login"
          element={
            <GuestRoute>
              <div>Login form</div>
            </GuestRoute>
          }
        />
        <Route path="/" element={<div>Dashboard</div>} />
        <Route path="/products" element={<div>Products page</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('GuestRoute', () => {
  afterEach(() => {
    mockUseAuth.mockReset();
  });

  it('shows loading screen while session bootstraps', () => {
    mockUseAuth.mockReturnValue({ status: 'loading' });

    renderGuestRoute('/login');

    expect(screen.getByRole('status')).toHaveTextContent('Loading session');
  });

  it('renders login when unauthenticated', () => {
    mockUseAuth.mockReturnValue({ status: 'unauthenticated' });

    renderGuestRoute('/login');

    expect(screen.getByText('Login form')).toBeInTheDocument();
  });

  it('redirects authenticated users away from login', () => {
    mockUseAuth.mockReturnValue({
      status: 'authenticated',
      mustChangePassword: false,
    });

    renderGuestRoute('/login');

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('redirects authenticated users with mustChangePassword to change-password', () => {
    mockUseAuth.mockReturnValue({
      status: 'authenticated',
      mustChangePassword: true,
    });

    render(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route
            path="/login"
            element={
              <GuestRoute>
                <div>Login form</div>
              </GuestRoute>
            }
          />
          <Route path="/change-password" element={<div>Change password</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Change password')).toBeInTheDocument();
  });

  it('honors redirect query param for authenticated users', () => {
    mockUseAuth.mockReturnValue({
      status: 'authenticated',
      mustChangePassword: false,
    });

    renderGuestRoute('/login?redirect=%2Fproducts');

    expect(screen.getByText('Products page')).toBeInTheDocument();
  });

  it('does not show login when session bootstrap fails', () => {
    mockUseAuth.mockReturnValue({
      status: 'error',
      sessionError: new Error('Failed to restore session'),
      retrySession: vi.fn(),
    });

    renderGuestRoute('/login');

    expect(screen.getByText('Could not load session')).toBeInTheDocument();
    expect(screen.queryByText('Login form')).not.toBeInTheDocument();
  });
});
