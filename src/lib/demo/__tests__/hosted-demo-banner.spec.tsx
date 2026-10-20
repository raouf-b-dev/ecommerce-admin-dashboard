import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import type { ComponentType } from 'react';

const { mockIsMockMode, mockIsDemoMode } = vi.hoisted(() => ({
  mockIsMockMode: vi.fn(),
  mockIsDemoMode: vi.fn(),
}));

vi.mock('@/lib/mock/is-mock-mode', () => ({
  isMockMode: mockIsMockMode,
}));

vi.mock('@/lib/demo/is-demo-mode', () => ({
  isDemoMode: mockIsDemoMode,
}));

vi.mock('@/features/auth/components/login-form', () => ({
  LoginForm: () => <div>Login form</div>,
}));

vi.mock('@/components/layout/app-header', () => ({
  AppHeader: () => <header>App header</header>,
}));

vi.mock('@/components/layout/app-sidebar', () => ({
  AppSidebar: () => <aside>App sidebar</aside>,
}));

vi.mock('@/components/layout/focus-on-route-change', () => ({
  FocusOnRouteChange: () => null,
}));

let LoginPage: ComponentType;
let AppLayout: ComponentType;

beforeAll(async () => {
  vi.stubEnv('VITE_DEMO_MODE', 'true');
  await import('@/lib/demo/hosted-demo-banner');
  ({ default: LoginPage } = await import('@/features/auth/pages/login-page'));
  ({ AppLayout } = await import('@/components/layout/app-layout'));
});

afterAll(() => {
  vi.unstubAllEnvs();
});

describe.each([
  ['login page', () => LoginPage],
  ['authenticated shell', () => AppLayout],
])('%s hosted demo banner', (_name, getView) => {
  it('announces the shared read-only notice in demo mode', async () => {
    mockIsMockMode.mockReturnValue(false);
    mockIsDemoMode.mockReturnValue(true);
    const View = getView();

    render(
      <MemoryRouter>
        <View />
      </MemoryRouter>,
    );

    expect(
      await screen.findByText(/Shared demo - admin is read-only/i),
    ).toBeInTheDocument();
  });

  it('hides the hosted banner when demo mode is off', () => {
    mockIsMockMode.mockReturnValue(false);
    mockIsDemoMode.mockReturnValue(false);
    const View = getView();

    render(
      <MemoryRouter>
        <View />
      </MemoryRouter>,
    );

    expect(
      screen.queryByText(/Shared demo - admin is read-only/i),
    ).not.toBeInTheDocument();
  });
});
