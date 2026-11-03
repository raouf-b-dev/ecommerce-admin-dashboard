import { render, screen, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { AdminUserMenu } from '@/components/layout/admin-user-menu';
import { ThemeProvider } from '@/components/theme/theme-provider';

const mockLogout = vi.fn();
const mockUseAuth = vi.fn();

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => mockUseAuth(),
}));

describe('AdminUserMenu', () => {
  beforeEach(() => {
    mockLogout.mockReset();
    mockUseAuth.mockReturnValue({
      session: {
        userId: '1',
        email: 'superadmin@store.local',
        role: 'SUPER_ADMIN',
        permissions: ['manage_roles', 'change_own_credentials'],
        mustChangePassword: false,
      },
      logout: mockLogout,
      hasPermission: (permission?: string) =>
        permission === 'manage_roles' ||
        permission === 'change_own_credentials',
    });
  });

  function renderMenu(defaultOpen = false) {
    return render(
      <ThemeProvider>
        <MemoryRouter>
          <AdminUserMenu defaultOpen={defaultOpen} />
        </MemoryRouter>
      </ThemeProvider>,
    );
  }

  it('renders operator trigger with initials and role', () => {
    renderMenu();

    const trigger = screen.getByRole('button', {
      name: /operator account menu for superadmin@store\.local/i,
    });
    expect(trigger).toBeInTheDocument();
    expect(screen.getByText('SU')).toBeInTheDocument();
    expect(screen.getByText('SUPER ADMIN')).toBeInTheDocument();
  });

  it('renders menu with quick links, appearance, and logout when open', () => {
    renderMenu(true);

    const rolesLink = screen.getByRole('menuitem', {
      name: /roles & permissions/i,
    });
    expect(rolesLink).toBeInTheDocument();
    expect(rolesLink).toHaveAttribute('href', '/settings/roles');
    expect(
      screen.getByRole('menuitem', { name: /change password/i }),
    ).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /log out/i })).toBeInTheDocument();
  });

  it('hides Roles & Permissions without manage_roles', () => {
    mockUseAuth.mockReturnValue({
      session: {
        userId: '2',
        email: 'catalog@store.local',
        role: 'CATALOG_MANAGER',
        permissions: ['change_own_credentials'],
        mustChangePassword: false,
      },
      logout: mockLogout,
      hasPermission: (permission?: string) =>
        permission === 'change_own_credentials',
    });

    renderMenu(true);

    expect(
      screen.queryByRole('menuitem', { name: /roles & permissions/i }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: /change password/i }),
    ).toBeInTheDocument();
  });

  it('hides Change Password without change_own_credentials', () => {
    mockUseAuth.mockReturnValue({
      session: {
        userId: '3',
        email: 'roles@store.local',
        role: 'ADMIN',
        permissions: ['manage_roles'],
        mustChangePassword: false,
      },
      logout: mockLogout,
      hasPermission: (permission?: string) => permission === 'manage_roles',
    });

    renderMenu(true);

    expect(
      screen.getByRole('menuitem', { name: /roles & permissions/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('menuitem', { name: /change password/i }),
    ).not.toBeInTheDocument();
  });

  it('calls logout when Log out is clicked', async () => {
    renderMenu(true);

    const logoutButton = screen.getByRole('menuitem', { name: /log out/i });
    await act(async () => {
      fireEvent.click(logoutButton);
    });

    expect(mockLogout).toHaveBeenCalledTimes(1);
  });
});
