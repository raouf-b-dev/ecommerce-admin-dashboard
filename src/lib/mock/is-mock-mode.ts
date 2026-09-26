// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: AGPL-3.0-only

export function isMockMode(): boolean {
  return (
    import.meta.env.MODE === 'mock' ||
    import.meta.env.VITE_ENABLE_MOCK === 'true'
  );
}
