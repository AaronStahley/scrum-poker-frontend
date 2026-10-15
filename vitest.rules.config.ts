/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'

// Firestore security rules tests. They need the Firestore emulator, so they
// run separately from the unit suite via `npm run test:rules`.
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['rules-tests/**/*.test.ts'],
    // Every test shares one emulator and clears it in beforeEach.
    fileParallelism: false,
    testTimeout: 15_000,
  },
  // Skip the app's TailwindCSS v4 PostCSS config, as vitest.config.ts does
  css: {
    postcss: {
      plugins: []
    }
  }
})
