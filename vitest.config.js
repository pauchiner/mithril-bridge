import {defineConfig} from 'vitest/config';
import {resolve, dirname} from 'node:path';
import {fileURLToPath} from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default defineConfig({
  resolve: {
    alias: [
      {
        find: /^sin$/,
        replacement: resolve(__dirname, 'node_modules/sin/src/index.js')
      }
    ],
  },
  test: {
    environment: 'happy-dom',
    coverage: {
      provider: 'v8',
      include: ['src/**'],
    },
  }
});
