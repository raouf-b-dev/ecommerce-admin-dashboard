// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: MIT

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function setAccessToken(token: string): void {
  accessToken = token;
}

export function clearAccessToken(): void {
  accessToken = null;
}
