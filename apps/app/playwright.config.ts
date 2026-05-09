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

const DEPLOYED_HOST = "personalized-courses.prin7r.com";
const DEPLOYED_URL = `https://${DEPLOYED_HOST}`;
const LOCAL_URL = "http://localhost:3100";

const isRemote = !!process.env.E2E_BASE_URL;
const isCI = !!process.env.CI;

// When running against a raw IP / localhost with TLS, we must send the
// correct Host header so Traefik can route.  Playwright browser-level
// request fixture doesn't let us set Host, but the APIRequestContext does
// via extraHTTPHeaders.  For CI/nightly, E2E_BASE_URL should be the
// publicly-routable domain; for internal testing, set E2E_EXTRA_HOST to
// the domain Traefik expects.
const extraHeaders = process.env.E2E_EXTRA_HOST
  ? { Host: process.env.E2E_EXTRA_HOST }
  : undefined;

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
    ...(extraHeaders ? { extraHTTPHeaders: extraHeaders } : {}),
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
