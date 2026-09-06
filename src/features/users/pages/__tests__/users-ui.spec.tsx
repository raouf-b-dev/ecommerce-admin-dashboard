import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import { UsersPage } from '@/features/users/pages/users-page';
import { UserDetailPage } from '@/features/users/pages/user-detail-page';
import { PermissionRoute } from '@/lib/auth/permission-route';

type ListQueryResult = {
  data:
    | {
        items: unknown[];
        total: number;
        page: number;
        limit: number;
        totalPages: number;
      }
    | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: ReturnType<typeof vi.fn>;
  isFetching: boolean;
};

const listQueryMock = vi.hoisted(() =>
  vi.fn((): ListQueryResult => ({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    isFetching: false,
  })),
);

const rolesQueryMock = vi.hoisted(() =>
  vi.fn(() => ({
    data: [
      {
        id: 1,
        code: 'CUSTOMER',
        name: 'Customer',
        isSystem: true,
        permissions: { codes: [] },
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
      {
        id: 2,
        code: 'ADMIN',
        name: 'Administrator',
        isSystem: true,
        permissions: { codes: [] },
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z',
      },
    ],
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: vi.fn(),
  })),
);

const sampleAddress = {
  id: 1,
  street: '100 Main Street',
  street2: 'Apartment 2B',
  city: 'San Francisco',
  state: 'CA',
  postalCode: '94103',
  country: 'USA',
  type: 'HOME' as const,
  isDefault: true,
  deliveryInstructions: 'Leave packages at front door.',
  createdAt: '2025-10-31T10:00:00.000Z',
  updatedAt: '2025-10-31T12:00:00.000Z',
};

const sampleUser = {
  id: 3,
  firstName: 'Store',
  lastName: 'Customer',
  email: 'customer@store.local',
  phone: null as string | null,
  isActive: true,
  roleCode: 'CUSTOMER',
  addressCount: 1,
  addresses: [sampleAddress],
  createdAt: '2025-10-31T10:00:00.000Z',
  updatedAt: '2025-10-31T12:00:00.000Z',
};

const detailQueryMock = vi.hoisted(() =>
  vi.fn(() => ({
    data: undefined as typeof sampleUser | undefined,
    isLoading: false,
    isError: false,
    error: null as Error | null,
    refetch: vi.fn(),
  })),
);

const authMock = vi.hoisted(() =>
  vi.fn(() => ({
    hasPermission: ((permission: string) =>
      permission === 'view_all_users' ||
      permission === 'view_all_orders') as (permission: string) => boolean,
  })),
);

vi.mock('@/features/users/hooks/use-users', () => ({
  useUsersListQuery: listQueryMock,
  useUserDetailQuery: detailQueryMock,
  useUpdateUser: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useActivateUser: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useDeactivateUser: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useAssignUserRole: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useAddUserAddress: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useUpdateUserAddress: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useDeleteUserAddress: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
  useSetDefaultUserAddress: () => ({
    mutateAsync: vi.fn(),
    isPending: false,
  }),
}));

vi.mock('@/features/roles/hooks/use-roles', () => ({
  useRolesListQuery: rolesQueryMock,
}));

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => authMock(),
}));

describe('UsersPage', () => {
  beforeEach(() => {
    listQueryMock.mockReset();
  });

  it('shows empty table message when there are no items', () => {
    listQueryMock.mockReturnValue({
      data: { items: [], total: 0, page: 1, limit: 20, totalPages: 0 },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    });

    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Users' })).toBeInTheDocument();
    expect(screen.getByText('No users found.')).toBeInTheDocument();
    expect(screen.getByLabelText('Role')).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Customer' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('option', { name: 'Administrator' }),
    ).toBeInTheDocument();
  });

  it('shows error alert with retry when the query fails', () => {
    const refetch = vi.fn();
    listQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Network down'),
      refetch,
      isFetching: false,
    });

    render(
      <MemoryRouter>
        <UsersPage />
      </MemoryRouter>,
    );

    expect(screen.getByText('Could not load users')).toBeInTheDocument();
    expect(screen.getByText('Network down')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Retry' }));
    expect(refetch).toHaveBeenCalled();
  });
});

describe('UserDetailPage', () => {
  beforeEach(() => {
    detailQueryMock.mockReset();
    authMock.mockReturnValue({
      hasPermission: ((permission: string) =>
        permission === 'view_all_users' ||
        permission === 'view_all_orders') as (permission: string) => boolean,
    });
  });

  it('rejects invalid user ids without querying', () => {
    detailQueryMock.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/users/not-a-number']}>
        <Routes>
          <Route path="/users/:userId" element={<UserDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText('Invalid user')).toBeInTheDocument();
    expect(detailQueryMock).toHaveBeenCalledWith(undefined);
  });

  it('renders user detail and view-orders link', () => {
    detailQueryMock.mockReturnValue({
      data: sampleUser,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/users/3']}>
        <Routes>
          <Route path="/users/:userId" element={<UserDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Store Customer' }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('customer@store.local').length).toBeGreaterThan(
      0,
    );
    expect(screen.getByText('Customer')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View orders' })).toHaveAttribute(
      'href',
      '/orders?userId=3',
    );
    expect(
      screen.getByRole('heading', { name: 'Addresses' }),
    ).toBeInTheDocument();
    expect(screen.getByText('100 Main Street')).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Add address' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Edit' })).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Delete' }),
    ).not.toBeInTheDocument();
  });

  it('shows profile and status actions for manage_users but not role assignment', () => {
    authMock.mockReturnValue({
      hasPermission: ((permission: string) =>
        permission === 'view_all_users' ||
        permission === 'view_all_orders' ||
        permission === 'manage_users') as (permission: string) => boolean,
    });
    detailQueryMock.mockReturnValue({
      data: sampleUser,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/users/3']}>
        <Routes>
          <Route path="/users/:userId" element={<UserDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('button', { name: 'Deactivate user' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Change role' }),
    ).not.toBeInTheDocument();
    expect(screen.queryByLabelText('Assigned role')).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Add address' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Edit' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Delete' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Set default' })).toBeDisabled();
  });

  it('shows role assignment when manage_roles is granted', () => {
    authMock.mockReturnValue({
      hasPermission: ((permission: string) =>
        permission === 'view_all_users' ||
        permission === 'manage_roles') as (permission: string) => boolean,
    });
    detailQueryMock.mockReturnValue({
      data: sampleUser,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });

    render(
      <MemoryRouter initialEntries={['/users/3']}>
        <Routes>
          <Route path="/users/:userId" element={<UserDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByLabelText('Assigned role')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Change role' })).toBeDisabled();
    expect(
      screen.queryByRole('button', { name: 'Deactivate user' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Add address' }),
    ).not.toBeInTheDocument();
  });
});

describe('Users PermissionRoute', () => {
  it('shows forbidden when view_all_users is missing', () => {
    authMock.mockReturnValue({
      hasPermission: (() => false) as (permission: string) => boolean,
    });

    render(
      <MemoryRouter>
        <PermissionRoute permission="view_all_users">
          <UsersPage />
        </PermissionRoute>
      </MemoryRouter>,
    );

    expect(
      screen.getByRole('heading', { name: 'Access denied' }),
    ).toBeInTheDocument();
  });
});
