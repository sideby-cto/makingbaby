
import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['./src/test/api-setup.ts'],
    include: ['**/*.api.test.{ts,tsx}'],
    reporters: ['default', 'json'],
    outputFile: {
      json: './test-results.json'
    },
    passWithNoTests: true,
    allowOnly: true,
    dangerouslyIgnoreUnhandledErrors: true,
    logLevel: 'info',
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
});
