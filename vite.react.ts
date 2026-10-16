import react from '@vitejs/plugin-react';

/** Vite production build and Vitest share this so unit tests compile the same way. */
export const reactPlugins = react({ compiler: true });
