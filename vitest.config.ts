import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import { reactPlugins } from './vite.react.ts';

export default defineConfig({
  plugins: reactPlugins,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.{spec,test}.{ts,tsx}'],
    exclude: ['e2e/**'],
  },
});
