import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router';
import { LoginForm } from '@/features/auth/components/login-form';

const mockLogin = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@/lib/auth/auth-context', () => ({
  useAuth: () => ({
    login: mockLogin,
  }),
}));

vi.mock('react-router', async () => {
  const actual = await vi.importActual('react-router');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useSearchParams: () => [new URLSearchParams('redirect=%2Fproducts')],
  };
});

describe('LoginForm', () => {
  afterEach(() => {
    mockLogin.mockReset();
    mockNavigate.mockReset();
  });

  it('shows validation errors for empty submit', async () => {
    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(await screen.findByText('Email is required')).toBeInTheDocument();
    expect(screen.getByText('Password is required')).toBeInTheDocument();
  });

  it('shows API error message on failed login', async () => {
    mockLogin.mockRejectedValue(new Error('Invalid credentials'));

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'admin@store.local' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'wrong' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByText('Invalid email or password.'),
    ).toBeInTheDocument();
  });

  it('shows a throttle message on HTTP 429', async () => {
    mockLogin.mockRejectedValue({ statusCode: 429 });

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'admin@store.local' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Admin123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByText(
        'Too many sign-in attempts. Wait about a minute and try again.',
      ),
    ).toBeInTheDocument();
  });

  it('shows operator-denied message for non-operator accounts', async () => {
    const { NotOperatorError } = await import('@/features/auth/api/auth-api');
    mockLogin.mockRejectedValue(new NotOperatorError());

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'customer@store.local' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Customer123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    expect(
      await screen.findByText(
        'This account cannot access the admin dashboard.',
      ),
    ).toBeInTheDocument();
  });

  it('navigates after successful login', async () => {
    mockLogin.mockResolvedValue({
      userId: '1',
      email: 'admin@store.local',
      role: 'ADMIN',
      permissions: [],
      mustChangePassword: false,
    });

    render(
      <MemoryRouter>
        <LoginForm />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'admin@store.local' },
    });
    fireEvent.change(screen.getByLabelText('Password'), {
      target: { value: 'Admin123!' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'admin@store.local',
        password: 'Admin123!',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/products', { replace: true });
    });
  });
});
