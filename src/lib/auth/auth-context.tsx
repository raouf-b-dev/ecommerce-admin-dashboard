import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import {
  buildSessionFromAccessToken,
  changePasswordRequest,
  loginRequest,
  logoutRequest,
  refreshSessionRequest,
} from '@/features/auth/api/auth-api';
import type {
  AuthSession,
  AuthStatus,
  ChangePasswordInput,
  LoginCredentials,
} from '@/features/auth/types';
import { clearAccessToken } from '@/lib/auth/auth-session';
import { hasPermission as checkPermission } from '@/lib/auth/permissions';

const AUTH_SESSION_QUERY_KEY = ['auth', 'session'] as const;

type AuthContextValue = {
  status: AuthStatus;
  session: AuthSession | null;
  isAuthenticated: boolean;
  mustChangePassword: boolean;
  login: (credentials: LoginCredentials) => Promise<AuthSession>;
  changePassword: (input: ChangePasswordInput) => Promise<AuthSession>;
  logout: () => Promise<void>;
  hasPermission: (permission?: string) => boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();

  const sessionQuery = useQuery({
    queryKey: AUTH_SESSION_QUERY_KEY,
    queryFn: refreshSessionRequest,
    retry: false,
    staleTime: Infinity,
  });

  const loginMutation = useMutation({
    mutationFn: loginRequest,
    onSuccess: (session) => {
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, session);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePasswordRequest,
    onSuccess: (session) => {
      queryClient.setQueryData(AUTH_SESSION_QUERY_KEY, session);
    },
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await logoutRequest();
      } finally {
        clearAccessToken();
      }
    },
    onSettled: () => {
      queryClient.clear();
    },
  });

  const status: AuthStatus = sessionQuery.isPending
    ? 'loading'
    : sessionQuery.data
      ? 'authenticated'
      : 'unauthenticated';

  const session = sessionQuery.data ?? null;

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      return loginMutation.mutateAsync(credentials);
    },
    [loginMutation],
  );

  const changePassword = useCallback(
    async (input: ChangePasswordInput) => {
      return changePasswordMutation.mutateAsync(input);
    },
    [changePasswordMutation],
  );

  const logout = useCallback(async () => {
    await logoutMutation.mutateAsync();
  }, [logoutMutation]);

  const hasPermission = useCallback(
    (permission?: string) =>
      checkPermission(session?.permissions ?? [], permission),
    [session?.permissions],
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      isAuthenticated: status === 'authenticated',
      mustChangePassword: session?.mustChangePassword ?? false,
      login,
      changePassword,
      logout,
      hasPermission,
    }),
    [status, session, login, changePassword, logout, hasPermission],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export { AUTH_SESSION_QUERY_KEY, buildSessionFromAccessToken };
