// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: MIT

import { setupWorker } from 'msw/browser';
import { handlers } from '@/lib/mock/handlers';

export const worker = setupWorker(...handlers);
