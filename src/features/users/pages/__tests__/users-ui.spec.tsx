import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router';
import type { useAuth } from '@/lib/auth/auth-context';
import { UsersPage } from '@/features/users/pages/users-page';
import { UserDetailPage } from '@/features/users/pages/user-detail-page';
import { PermissionRoute } from '@/lib/auth/permission-route';
import type { AddressResponseDto, UserDetailResponseDto } from '@/features/users/types';

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

type DetailQueryResult = {
  data: UserDetailResponseDto | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  refetch: ReturnType<typeof vi.fn>;
};

type OrdersListQueryResult = {
  data:
    | {
        items: Array<{
          id: number;
          orderNumber: string;
          status: string;
          totalAmount: number;
          currency: string;
          createdAt: string;
        }>;
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
    error: null satisfies Error | null,
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
  type: 'HOME',
  isDefault: true,
  deliveryInstructions: 'Leave packages at front door.',
  createdAt: '2025-10-31T10:00:00.000Z',
  updatedAt: '2025-10-31T12:00:00.000Z',
} satisfies AddressResponseDto;

const sampleUser = {
  id: 3,
  firstName: 'Store',
  lastName: 'Customer',
  email: 'customer@store.local',
  phone: null,
  isActive: true,
  roleCode: 'CUSTOMER',
  addressCount: 1,
  addresses: [sampleAddress],
  createdAt: '2025-10-31T10:00:00.000Z',
  updatedAt: '2025-10-31T12:00:00.000Z',
} satisfies UserDetailResponseDto;

const detailQueryMock = vi.hoisted(() =>
  vi.fn((): DetailQueryResult => ({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
  })),
);

const hasPermission = vi.hoisted(() =>
  vi.fn<ReturnType<typeof useAuth>['hasPermission']>(),
);

const ordersListQueryMock = vi.hoisted(() =>
  vi.fn((): OrdersListQueryResult => ({
    data: undefined,
    isLoading: false,
    isError: false,
    error: null,
    refetch: vi.fn(),
    isFetching: false,
  })),
);

vi.mock('@/features/orders/hooks/use-orders', () => ({
  useOrdersListQuery: ordersListQueryMock,
}));

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
  useAuth: () => ({ hasPermission }),
}));

function grantPermissions(...codes: string[]) {
  hasPermission.mockImplementation((permission) =>
    typeof permission === 'string' ? codes.includes(permission) : false,
  );
}

describe('UsersPage', () => {
  beforeEach(() => {
    listQueryMock.mockReset();
    hasPermission.mockReset();
    grantPermissions('view_all_users', 'view_all_orders');
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
    ordersListQueryMock.mockReset();
    hasPermission.mockReset();
    ordersListQueryMock.mockReturnValue({
      data: { items: [], total: 0, page: 1, limit: 5, totalPages: 0 },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    });
    grantPermissions('view_all_users', 'view_all_orders');
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
      screen.getByRole('heading', { name: 'Order history' }),
    ).toBeInTheDocument();
    expect(screen.getByText('No orders yet.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View all' })).toHaveAttribute(
      'href',
      '/orders?userId=3',
    );
    expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Users' })).toHaveAttribute(
      'href',
      '/users',
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

  it('hides order history when view_all_orders is missing', () => {
    grantPermissions('view_all_users');
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
      screen.queryByRole('heading', { name: 'Order history' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'View orders' }),
    ).not.toBeInTheDocument();
    expect(ordersListQueryMock).not.toHaveBeenCalled();
  });

  it('lists recent orders for the user when the API returns them', () => {
    detailQueryMock.mockReturnValue({
      data: sampleUser,
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
    });
    ordersListQueryMock.mockReturnValue({
      data: {
        items: [
          {
            id: 12,
            orderNumber: 'ORD-2026-0012',
            status: 'confirmed',
            totalAmount: 49.5,
            currency: 'USD',
            createdAt: '2026-03-01T12:00:00.000Z',
          },
        ],
        total: 1,
        page: 1,
        limit: 5,
        totalPages: 1,
      },
      isLoading: false,
      isError: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
    });

    render(
      <MemoryRouter initialEntries={['/users/3']}>
        <Routes>
          <Route path="/users/:userId" element={<UserDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );

    expect(ordersListQueryMock).toHaveBeenCalledWith({
      userId: 3,
      page: 1,
      limit: 5,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });
    expect(
      screen.getByRole('link', { name: 'ORD-2026-0012' }),
    ).toHaveAttribute('href', '/orders/12');
  });

  it('shows profile and status actions for manage_users but not role assignment', () => {
    grantPermissions('view_all_users', 'view_all_orders', 'manage_users');
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
    grantPermissions('view_all_users', 'manage_roles');
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
    hasPermission.mockReturnValue(false);

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
