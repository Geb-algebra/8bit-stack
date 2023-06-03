/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./test/setup-test-env.ts'],
    singleThread: true, // set this to avoid multiple tests trying to interact DB at the same time.
  },
});
