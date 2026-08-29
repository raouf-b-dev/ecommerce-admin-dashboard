import type { components } from '@/lib/api/generated/schema';

export type LoginCredentials = components['schemas']['LoginDto'];

export type AuthTokensResponse = {
  accessToken: string;
  refreshToken?: string;
};

export type AuthSession = {
  userId: string;
  email: string;
  role: string;
  permissions: string[];
};

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';
