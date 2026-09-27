// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: MIT

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
