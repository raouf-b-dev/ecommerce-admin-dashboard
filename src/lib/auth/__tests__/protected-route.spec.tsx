import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { ProtectedRoute } from '@/lib/auth/protected-route';

const mockUseAuth = vi.fn();

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

function renderProtected(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<div>Login page</div>} />
        <Route
          path="/products"
          element={
            <ProtectedRoute>
              <div>Protected content</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ProtectedRoute', () => {
  afterEach(() => {
    mockUseAuth.mockReset();
  });

  it('shows loading screen while session bootstraps', () => {
    mockUseAuth.mockReturnValue({ status: 'loading' });

    renderProtected('/products');

    expect(screen.getByRole('status')).toHaveTextContent('Loading session');
  });

  it('redirects unauthenticated users to login', () => {
    mockUseAuth.mockReturnValue({ status: 'unauthenticated' });

    renderProtected('/products');

    expect(screen.getByText('Login page')).toBeInTheDocument();
  });

  it('renders children when authenticated', () => {
    mockUseAuth.mockReturnValue({ status: 'authenticated' });

    renderProtected('/products');

    expect(screen.getByText('Protected content')).toBeInTheDocument();
  });

  it('stays on an error surface instead of login when bootstrap fails', () => {
    mockUseAuth.mockReturnValue({
      status: 'error',
      sessionError: new Error('Failed to restore session'),
      retrySession: vi.fn(),
    });

    renderProtected('/products');

    expect(screen.getByText('Could not load session')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
  });
});
