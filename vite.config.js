import { defineConfig } from 'vite';

// This is only for the `pnpm dev` on the exampl folder
export default defineConfig({
  root: 'example',
  server: {
    fs: {
      allow: ['..']
    }
  },
  resolve: {
    conditions: ['import', 'module', 'default'],
  },
});
