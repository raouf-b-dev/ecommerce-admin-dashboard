import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { reactPlugins } from './vite.react.ts';

export default defineConfig({
  plugins: reactPlugins,
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    // Keep this off Tempo (3200) and Windows Hyper-V reserved ranges (3000-3199).
    port: 5174,
    strictPort: true,
  },
  preview: {
    port: 5174,
    strictPort: true,
  },
});
