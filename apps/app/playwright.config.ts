import { defineConfig, devices } from "@playwright/test";

/**
 * E2E test configuration for Curriculum7 app.
 *
 * Local dev:
 *   cd apps/app && pnpm exec playwright test
 *   (starts dev server via webServer, uses http://localhost:3100)
 *
 * CI / nightly against deployed:
 *   E2E_BASE_URL=https://personalized-courses.prin7r.com npx playwright test
 *   (no webServer — runs against the live Traefik-proxied app)
 *
 * The Next.js basePath is /app, so all routes are under /app.
 */

const DEPLOYED_URL = "https://personalized-courses.prin7r.com";
const LOCAL_URL = "http://localhost:3100";

const isRemote = !!process.env.E2E_BASE_URL;
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.E2E_BASE_URL ?? LOCAL_URL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // Skip webServer when running against a remote URL or in CI
  webServer:
    isRemote || isCI
      ? undefined
      : {
          command: "pnpm dev",
          url: `${LOCAL_URL}/app/api/healthz`,
          reuseExistingServer: true,
          cwd: "..",
        },
});
