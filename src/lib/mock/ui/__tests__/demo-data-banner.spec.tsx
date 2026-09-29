import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import type { ComponentType } from 'react';

const { mockIsMockMode } = vi.hoisted(() => ({
  mockIsMockMode: vi.fn(),
}));

vi.mock('@/lib/mock/is-mock-mode', () => ({
  isMockMode: mockIsMockMode,
}));

vi.mock('@/features/auth/components/login-form', () => ({
  LoginForm: () => <div>Login form</div>,
}));

vi.mock('@/lib/mock/ui/demo-login-actions', () => ({
  default: () => <div>Demo login actions</div>,
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
  vi.stubEnv('VITE_ENABLE_MOCK', 'true');
  ({ default: LoginPage } = await import('@/features/auth/pages/login-page'));
  ({ AppLayout } = await import('@/components/layout/app-layout'));
});

afterAll(() => {
  vi.unstubAllEnvs();
});

describe.each([
  ['login page', () => LoginPage],
  ['authenticated shell', () => AppLayout],
])('%s demo-data banner', (_name, getView) => {
  it('announces the data-reset notice in mock mode', async () => {
    mockIsMockMode.mockReturnValue(true);
    const View = getView();

    render(
      <MemoryRouter>
        <View />
      </MemoryRouter>,
    );

    const notice = await screen.findByText('Demo data, resets on reload');
    expect(notice).toHaveAttribute('role', 'status');
    expect(notice).toBeVisible();
  });

  it('omits the notice outside mock mode', () => {
    mockIsMockMode.mockReturnValue(false);
    const View = getView();

    render(
      <MemoryRouter>
        <View />
      </MemoryRouter>,
    );

    expect(
      screen.queryByText('Demo data, resets on reload'),
    ).not.toBeInTheDocument();
  });
});
