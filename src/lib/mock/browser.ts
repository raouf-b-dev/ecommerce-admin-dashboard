import { setupWorker } from 'msw/browser';
import { handlers } from '@/lib/mock/handlers';

export const worker = setupWorker(...handlers);
