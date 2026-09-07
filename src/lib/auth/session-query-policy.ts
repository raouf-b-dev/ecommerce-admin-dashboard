import {
  isAccessTokenUsable,
  msUntilAccessTokenRefresh,
} from '@/lib/auth/access-token';

export const SESSION_REFRESH_ERROR_BACKOFF_MS = 15_000;

export function getSessionRefetchInterval(args: {
  hasSession: boolean;
  hasError: boolean;
  accessToken: string | null;
}): number | false {
  if (!args.hasSession) {
    return false;
  }
  if (args.hasError) {
    return SESSION_REFRESH_ERROR_BACKOFF_MS;
  }
  return msUntilAccessTokenRefresh(args.accessToken) ?? false;
}

export function getSessionRefetchOnFocusOrReconnect(args: {
  hasSession: boolean;
  accessToken: string | null;
}): false | 'always' {
  if (!args.hasSession) {
    return false;
  }
  return isAccessTokenUsable(args.accessToken) ? false : 'always';
}
