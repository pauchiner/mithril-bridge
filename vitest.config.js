import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      include: ['src/**'],
    },
    environment: 'happy-dom',
  },
  resolve: {
    conditions: ['import', 'module', 'default'],
  },
})
