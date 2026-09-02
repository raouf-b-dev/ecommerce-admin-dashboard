import { createBrowserRouter, Outlet } from 'react-router';
import { AppLayout } from '@/components/layout/app-layout';
import { LoginPage } from '@/features/auth/pages/login-page';
import { ChangePasswordPage } from '@/features/auth/pages/change-password-page';
import { RolesSettingsPage } from '@/features/roles/pages/roles-settings-page';
import { DashboardPage } from '@/features/dashboard/pages/dashboard-page';
import { OrdersPage } from '@/features/orders/pages/orders-page';
import { OrderDetailPage } from '@/features/orders/pages/order-detail-page';
import { ProductsPage } from '@/features/products/pages/products-page';
import { ProductCreatePage } from '@/features/products/pages/product-create-page';
import { ProductEditPage } from '@/features/products/pages/product-edit-page';
import { InventoryPage } from '@/features/inventory/pages/inventory-page';
import { InventoryDetailPage } from '@/features/inventory/pages/inventory-detail-page';
import { UsersPage } from '@/features/users/pages/users-page';
import { UserDetailPage } from '@/features/users/pages/user-detail-page';
import { GuestRoute } from '@/lib/auth/guest-route';
import {
  ChangePasswordRoute,
  RequirePasswordChanged,
} from '@/lib/auth/must-change-password-route';
import { OperatorRoute } from '@/lib/auth/operator-route';
import { PermissionRoute } from '@/lib/auth/permission-route';
import { ProtectedRoute } from '@/lib/auth/protected-route';
import { NotFoundPage } from '@/app/pages/not-found-page';
import { RootErrorPage } from '@/app/pages/root-error-page';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <GuestRoute>
        <LoginPage />
      </GuestRoute>
    ),
  },
  {
    path: '/change-password',
    element: (
      <ProtectedRoute>
        <ChangePasswordRoute>
          <ChangePasswordPage />
        </ChangePasswordRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <RequirePasswordChanged>
          <OperatorRoute>
            <AppLayout />
          </OperatorRoute>
        </RequirePasswordChanged>
      </ProtectedRoute>
    ),
    errorElement: <RootErrorPage />,
    children: [
      {
        index: true,
        element: (
          <PermissionRoute permission="view_all_orders">
            <DashboardPage />
          </PermissionRoute>
        ),
      },
      {
        path: 'products',
        element: (
          <PermissionRoute permission="view_all_products">
            <Outlet />
          </PermissionRoute>
        ),
        children: [
          {
            index: true,
            element: <ProductsPage />,
          },
          {
            path: 'new',
            element: (
              <PermissionRoute permission="manage_products">
                <ProductCreatePage />
              </PermissionRoute>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <PermissionRoute permission="manage_products">
                <ProductEditPage />
              </PermissionRoute>
            ),
          },
        ],
      },
      {
        path: 'inventory',
        element: (
          <PermissionRoute permission="view_all_inventory">
            <Outlet />
          </PermissionRoute>
        ),
        children: [
          {
            index: true,
            element: <InventoryPage />,
          },
          {
            path: ':productId',
            element: <InventoryDetailPage />,
          },
        ],
      },
      {
        path: 'orders',
        element: (
          <PermissionRoute permission="view_all_orders">
            <Outlet />
          </PermissionRoute>
        ),
        children: [
          {
            index: true,
            element: <OrdersPage />,
          },
          {
            path: ':orderId',
            element: <OrderDetailPage />,
          },
        ],
      },
      {
        path: 'users',
        element: (
          <PermissionRoute permission="view_all_users">
            <Outlet />
          </PermissionRoute>
        ),
        children: [
          {
            index: true,
            element: <UsersPage />,
          },
          {
            path: ':userId',
            element: <UserDetailPage />,
          },
        ],
      },
      {
        path: 'settings/roles',
        element: (
          <PermissionRoute permission="manage_roles">
            <RolesSettingsPage />
          </PermissionRoute>
        ),
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
]);
