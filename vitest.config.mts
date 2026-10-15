/// <reference types="vitest" />
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: true,
    exclude: ['**/node_modules/**', '**/e2e/**', '**/rules-tests/**'],
    css: {
      modules: {
        classNameStrategy: 'non-scoped'
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(import.meta.dirname, './src'),
    },
  },
  // Override PostCSS config for tests to avoid TailwindCSS v4 issues
  css: {
    postcss: {
      plugins: []
    }
  }
})