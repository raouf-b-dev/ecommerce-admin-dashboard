// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: AGPL-3.0-only

/** Reject open redirects: only same-origin relative paths. Reject auth-route loops. */
export function safeRedirectPath(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//')) {
    return '/';
  }

  if (
    value === '/login' ||
    value.startsWith('/login?') ||
    value.startsWith('/login/') ||
    value === '/change-password' ||
    value.startsWith('/change-password?') ||
    value.startsWith('/change-password/')
  ) {
    return '/';
  }

  return value;
}
