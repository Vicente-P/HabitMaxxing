import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

const integrationTests = '**/*.integration.test.ts'

// Vitest runs every project unless one is selected, so the integration project (Docker/PostgreSQL)
// is registered only when explicitly requested: `pnpm test:integration` = `vitest run --project integration`.
const integrationRequested = process.argv.some((arg, i, all) => arg === 'integration' && all[i - 1] === '--project')

export default defineConfig({
  test: {
    passWithNoTests: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: ['src/generated/**', 'src/types/**', '**/*.d.ts'],
    },
    projects: [
      {
        // Default project: fast, no Docker, no database.
        plugins: [tsconfigPaths(), react()],
        test: {
          name: 'unit',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./src/test/setup.ts'],
          // e2e/ belongs to Playwright (`pnpm test:e2e`); Vitest must never collect it.
          exclude: ['**/node_modules/**', '**/dist/**', 'e2e/**', integrationTests],
        },
      },
      ...(integrationRequested
        ? [
          {
            // Real PostgreSQL (Testcontainers or TEST_DATABASE_URL). Run with `pnpm test:integration`.
            plugins: [tsconfigPaths()],
            test: {
              name: 'integration',
              environment: 'node',
              globals: true,
              include: [integrationTests],
              exclude: ['**/node_modules/**', '**/dist/**'],
              globalSetup: ['./src/test/integration/global-setup.ts'],
              fileParallelism: false,
              testTimeout: 30_000,
              hookTimeout: 120_000,
            },
          },
          ]
        : []),
    ],
  },
})
