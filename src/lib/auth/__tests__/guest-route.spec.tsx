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
    mockUseAuth.mockReturnValue({ status: 'authenticated' });

    renderGuestRoute('/login');

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('honors redirect query param for authenticated users', () => {
    mockUseAuth.mockReturnValue({ status: 'authenticated' });

    renderGuestRoute('/login?redirect=%2Fproducts');

    expect(screen.getByText('Products page')).toBeInTheDocument();
  });
});
