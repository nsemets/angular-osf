import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    setupFiles: ['setup-vitest.ts'],
    environment: 'jsdom',
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: 'v8',
      reportsDirectory: 'coverage',
      reporter: ['json-summary', 'lcov', 'text-summary'],
      thresholds: {
        branches: 43.3,
        functions: 43.8,
        lines: 70.18,
        statements: 70.6,
      },
    },
  },
});
