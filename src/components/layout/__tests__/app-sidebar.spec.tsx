import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AppSidebar } from '@/components/layout/app-sidebar';

const mockUseAuth = vi.fn();

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('AppSidebar', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      session: {
        permissions: [
          'view_all_products',
          'view_all_orders',
          'manage_roles',
        ],
      },
    });
  });

  afterEach(() => {
    mockUseAuth.mockReset();
  });

  it('renders navigation links from config', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <AppSidebar />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Products' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Orders' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Roles' })).toBeInTheDocument();
  });

  it('marks the current route as active', () => {
    render(
      <MemoryRouter initialEntries={['/products']}>
        <AppSidebar />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Products' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute(
      'aria-current',
      'page',
    );
  });

  it('hides links the operator lacks permission for', () => {
    mockUseAuth.mockReturnValue({
      session: {
        permissions: ['view_all_products'],
      },
    });

    render(
      <MemoryRouter initialEntries={['/']}>
        <AppSidebar />
      </MemoryRouter>,
    );

    expect(screen.getByRole('link', { name: 'Products' })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Orders' })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: 'Roles' })).not.toBeInTheDocument();
  });
});
