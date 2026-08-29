import { createBrowserRouter, Outlet } from 'react-router';
import { AppLayout } from '@/components/layout/app-layout';
import { LoginPage } from '@/features/auth/pages/login-page';
import { ChangePasswordPage } from '@/features/auth/pages/change-password-page';
import { RolesSettingsPage } from '@/features/auth/pages/roles-settings-page';
import { DashboardPage } from '@/features/dashboard/pages/dashboard-page';
import { OrdersPage } from '@/features/orders/pages/orders-page';
import { ProductsPage } from '@/features/products/pages/products-page';
import { ProductCreatePage } from '@/features/products/pages/product-create-page';
import { ProductEditPage } from '@/features/products/pages/product-edit-page';
import { GuestRoute } from '@/lib/auth/guest-route';
import {
  ChangePasswordRoute,
  RequirePasswordChanged,
} from '@/lib/auth/must-change-password-route';
import { PermissionRoute } from '@/lib/auth/permission-route';
import { ProtectedRoute } from '@/lib/auth/protected-route';
import { NotFoundPage } from '@/app/pages/not-found-page';

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
          <AppLayout />
        </RequirePasswordChanged>
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
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
        path: 'orders',
        element: <OrdersPage />,
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
