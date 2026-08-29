import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { OperatorRoute } from '@/lib/auth/operator-route';

const mockUseAuth = vi.fn();

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('OperatorRoute', () => {
  afterEach(() => {
    mockUseAuth.mockReset();
  });

  it('renders denial outside shell when access_admin is missing', () => {
    mockUseAuth.mockReturnValue({
      session: {
        userId: '9',
        email: 'customer@store.local',
        role: 'CUSTOMER',
        permissions: ['view_own_orders'],
        mustChangePassword: false,
      },
      hasPermission: () => false,
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <OperatorRoute>
          <div>Shell content</div>
        </OperatorRoute>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Access denied' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Shell content')).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Back to dashboard' }),
    ).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument();
  });

  it('renders children when access_admin is granted', () => {
    mockUseAuth.mockReturnValue({
      session: {
        userId: '1',
        email: 'admin@store.local',
        role: 'ADMIN',
        permissions: ['access_admin', 'view_all_orders'],
        mustChangePassword: false,
      },
      hasPermission: (permission?: string) => permission === 'access_admin',
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <OperatorRoute>
          <div>Shell content</div>
        </OperatorRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText('Shell content')).toBeInTheDocument();
  });
});
