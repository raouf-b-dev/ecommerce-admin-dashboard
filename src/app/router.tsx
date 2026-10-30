import { lazy, Suspense } from 'react';
import { createBrowserRouter, Outlet } from 'react-router';
import { AppLayout } from '@/components/layout/app-layout';
import { DocumentTitle } from '@/components/layout/document-title';
import { GuestRoute } from '@/lib/auth/guest-route';
import {
  ChangePasswordRoute,
  RequirePasswordChanged,
} from '@/lib/auth/must-change-password-route';
import { IndexLandingGate } from '@/lib/auth/index-landing-gate';
import { OperatorRoute } from '@/lib/auth/operator-route';
import { PermissionRoute } from '@/lib/auth/permission-route';
import { ProtectedRoute } from '@/lib/auth/protected-route';
import { NotFoundPage } from '@/app/pages/not-found-page';
import { RootErrorPage } from '@/app/pages/root-error-page';

const LoginPage = lazy(() => import('@/features/auth/pages/login-page'));
const ChangePasswordPage = lazy(() =>
  import('@/features/auth/pages/change-password-page'),
);
const RolesSettingsPage = lazy(() =>
  import('@/features/roles/pages/roles-settings-page'),
);
const DashboardPage = lazy(() =>
  import('@/features/dashboard/pages/dashboard-page'),
);
const OrdersPage = lazy(() => import('@/features/orders/pages/orders-page'));
const OrderDetailPage = lazy(() =>
  import('@/features/orders/pages/order-detail-page'),
);
const ProductsPage = lazy(() =>
  import('@/features/products/pages/products-page'),
);
const ProductCreatePage = lazy(() =>
  import('@/features/products/pages/product-create-page'),
);
const ProductEditPage = lazy(() =>
  import('@/features/products/pages/product-edit-page'),
);
const CategoriesPage = lazy(() =>
  import('@/features/products/pages/categories-page'),
);
const InventoryPage = lazy(() =>
  import('@/features/inventory/pages/inventory-page'),
);
const InventoryDetailPage = lazy(() =>
  import('@/features/inventory/pages/inventory-detail-page'),
);
const UsersPage = lazy(() => import('@/features/users/pages/users-page'));
const UserDetailPage = lazy(() =>
  import('@/features/users/pages/user-detail-page'),
);

function RouteFallback() {
  return (
    <p className="text-sm text-muted-foreground" role="status" aria-live="polite">
      Loading…
    </p>
  );
}

function RootDocumentTitle() {
  return (
    <>
      <DocumentTitle />
      <Outlet />
    </>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootDocumentTitle />,
    errorElement: <RootErrorPage />,
    children: [
      {
        path: '/login',
        handle: { title: 'Sign in' },
        element: (
          <GuestRoute>
            <Suspense fallback={<RouteFallback />}>
              <LoginPage />
            </Suspense>
          </GuestRoute>
        ),
      },
      {
        path: '/change-password',
        handle: { title: 'Change password' },
        element: (
          <ProtectedRoute>
            <ChangePasswordRoute>
              <Suspense fallback={<RouteFallback />}>
                <ChangePasswordPage />
              </Suspense>
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
        children: [
          {
            index: true,
            handle: { title: 'Dashboard' },
            element: (
              <IndexLandingGate>
                <DashboardPage />
              </IndexLandingGate>
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
                handle: { title: 'Products' },
                element: <ProductsPage />,
              },
              {
                path: 'new',
                handle: { title: 'Create product' },
                element: (
                  <PermissionRoute permission="manage_products">
                    <ProductCreatePage />
                  </PermissionRoute>
                ),
              },
              {
                path: 'categories',
                handle: { title: 'Categories' },
                element: <CategoriesPage />,
              },
              {
                path: ':id/edit',
                handle: { title: 'Edit product' },
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
                handle: { title: 'Inventory' },
                element: <InventoryPage />,
              },
              {
                path: ':productId',
                handle: { title: 'Inventory detail' },
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
                handle: { title: 'Orders' },
                element: <OrdersPage />,
              },
              {
                path: ':orderId',
                handle: { title: 'Order detail' },
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
                handle: { title: 'Users' },
                element: <UsersPage />,
              },
              {
                path: ':userId',
                handle: { title: 'User detail' },
                element: <UserDetailPage />,
              },
            ],
          },
          {
            path: 'settings/roles',
            handle: { title: 'Roles' },
            element: (
              <PermissionRoute permission="manage_roles">
                <RolesSettingsPage />
              </PermissionRoute>
            ),
          },
          {
            path: '*',
            handle: { title: 'Not Found' },
            element: <NotFoundPage />,
          },
        ],
      },
    ],
  },
]);
