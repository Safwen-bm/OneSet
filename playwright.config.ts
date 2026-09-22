import { defineConfig, devices } from '@playwright/test';

/**
 * Runs the checkout e2e spec against the local dev stack. Needs Postgres up
 * (`npm run db:up`, migrated and seeded) — see README → "End-to-end tests".
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  timeout: 60_000,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});