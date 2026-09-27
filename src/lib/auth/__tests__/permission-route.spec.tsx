import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { PermissionRoute } from '@/lib/auth/permission-route';

const mockUseAuth = vi.fn();

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('PermissionRoute', () => {
  afterEach(() => {
    mockUseAuth.mockReset();
  });

  it('renders forbidden page when permission is missing', () => {
    mockUseAuth.mockReturnValue({
      hasPermission: () => false,
    });

    render(
      <MemoryRouter>
        <PermissionRoute permission="manage_roles">
          <div>Restricted content</div>
        </PermissionRoute>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Access denied' }),
    ).toBeInTheDocument();
  });

  it('renders children when permission is granted', () => {
    mockUseAuth.mockReturnValue({
      hasPermission: () => true,
    });

    render(
      <MemoryRouter>
        <PermissionRoute permission="manage_roles">
          <div>Restricted content</div>
        </PermissionRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText('Restricted content')).toBeInTheDocument();
  });
});
