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
        permissions: ['manage_all'],
        mustChangePassword: false,
      },
      logout: mockLogout,
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

    expect(screen.getByRole('menuitem', { name: /roles & permissions/i })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /change password/i })).toBeInTheDocument();
    expect(screen.getByText('Appearance')).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: /log out/i })).toBeInTheDocument();
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
