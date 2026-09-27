import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter, Route, Routes } from 'react-router';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '@/lib/auth/auth-context';
import { ProtectedRoute } from '@/lib/auth/protected-route';
import { resetSilentRefreshLatchForTests } from '@/lib/api/silent-refresh';
import { clearAccessToken } from '@/lib/auth/auth-session';
import { createAdminAccessToken } from '@/test/create-test-jwt';

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function renderProtectedApp() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retryDelay: 0 },
      mutations: { retry: false },
    },
  });

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MemoryRouter initialEntries={['/products']}>
          <Routes>
            <Route path="/login" element={<div>Login page</div>} />
            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  <SessionProbe />
                </ProtectedRoute>
              }
            />
          </Routes>
        </MemoryRouter>
      </AuthProvider>
    </QueryClientProvider>,
  );
}

function SessionProbe() {
  const { session } = useAuth();
  return <div>Protected {session?.email}</div>;
}

describe('AuthProvider session bootstrap', () => {
  beforeEach(() => {
    resetSilentRefreshLatchForTests();
    clearAccessToken();
  });

  afterEach(() => {
    resetSilentRefreshLatchForTests();
    clearAccessToken();
    vi.unstubAllGlobals();
  });

  it('restores an operator session from a successful refresh', async () => {
    const token = createAdminAccessToken({ email: 'admin@store.local' });
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() =>
        Promise.resolve(
          jsonResponse({
            accessToken: token,
            permissions: ['access_admin'],
            mustChangePassword: false,
          }),
        ),
      ),
    );

    renderProtectedApp();

    expect(await screen.findByText('Protected admin@store.local')).toBeInTheDocument();
    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
  });

  it('sends the operator to login when the refresh cookie is gone', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(null, { status: 401 })),
    );

    renderProtectedApp();

    expect(await screen.findByText('Login page')).toBeInTheDocument();
    expect(screen.queryByText(/Protected/)).not.toBeInTheDocument();
  });

  it('does not treat a boot 5xx as logout', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockImplementation(() =>
        Promise.resolve(
          jsonResponse({ statusCode: 500, message: 'Unavailable' }, 500),
        ),
      ),
    );

    renderProtectedApp();

    expect(await screen.findByText('Could not load session')).toBeInTheDocument();
    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
  });

  it('retries a failed boot refresh without sending the operator to login', async () => {
    const token = createAdminAccessToken({ email: 'admin@store.local' });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        jsonResponse({ statusCode: 500, message: 'Unavailable' }, 500),
      )
      .mockResolvedValueOnce(
        jsonResponse({ statusCode: 500, message: 'Unavailable' }, 500),
      )
      .mockResolvedValueOnce(
        jsonResponse({ statusCode: 500, message: 'Unavailable' }, 500),
      )
      .mockResolvedValueOnce(
        jsonResponse({
          accessToken: token,
          permissions: ['access_admin'],
          mustChangePassword: false,
        }),
      );
    vi.stubGlobal('fetch', fetchMock);

    renderProtectedApp();

    expect(await screen.findByText('Could not load session')).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: 'Retry' }));

    expect(
      await screen.findByText('Protected admin@store.local'),
    ).toBeInTheDocument();
    expect(screen.queryByText('Login page')).not.toBeInTheDocument();
  });

  it('updates chrome when a mid-request silent refresh mints new claims', async () => {
    const first = createAdminAccessToken({ email: 'admin@store.local' });
    const second = createAdminAccessToken({ email: 'rotated@store.local' });
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValueOnce(
          jsonResponse({
            accessToken: first,
            permissions: ['access_admin'],
            mustChangePassword: false,
          }),
        )
        .mockResolvedValueOnce(
          jsonResponse({
            accessToken: second,
            permissions: ['access_admin'],
            mustChangePassword: false,
          }),
        ),
    );

    renderProtectedApp();
    expect(await screen.findByText('Protected admin@store.local')).toBeInTheDocument();

    const { silentRefreshAccessToken } = await import('@/lib/api/silent-refresh');
    await silentRefreshAccessToken();

    await waitFor(() => {
      expect(
        screen.getByText('Protected rotated@store.local'),
      ).toBeInTheDocument();
    });
  });
});
