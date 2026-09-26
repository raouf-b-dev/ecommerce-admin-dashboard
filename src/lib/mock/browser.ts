// Copyright (c) 2026 Abderaouf Bouzerara
// SPDX-License-Identifier: AGPL-3.0-only

import { setupWorker } from 'msw/browser';
import { handlers } from '@/lib/mock/handlers';

export const worker = setupWorker(...handlers);
