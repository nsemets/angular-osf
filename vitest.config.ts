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
        branches: 73.6,
        functions: 87.0,
        lines: 85.2,
        statements: 85.0,
      },
    },
  },
});
