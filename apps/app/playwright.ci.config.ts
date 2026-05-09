/**
 * Playwright config for CI / nightly runs against the deployed URL.
 *
 * Since public DNS for Personalized Courses domains may be stale, this config
 * resolves the VPS IP directly and passes the correct Host header.
 *
 * Usage:
 *   pnpm test:e2e:ci
 *
 * Override via env:
 *   E2E_BASE_URL=https://curriculum7.prin7r-app.com pnpm test:e2e:ci
 */
import { defineConfig, devices } from "@playwright/test";

const VPS_IP = process.env.E2E_VPS_IP ?? "144.91.94.91";
const VIRTUAL_HOST =
  process.env.E2E_VIRTUAL_HOST ?? "personalized-courses.prin7r.com";
const baseURL =
  process.env.E2E_BASE_URL ?? `https://${VPS_IP}`;

// Export E2E_VPS_IP so spec files can detect deployed vs local mode.
process.env.E2E_VPS_IP = VPS_IP;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: true,
  retries: 2,
  workers: 1,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
    // TLS cert is for the domain, not the IP — ignore mismatch.
    ignoreHTTPSErrors: true,
    // Send the correct Host header so Traefik routes to the right backend.
    extraHTTPHeaders: {
      Host: VIRTUAL_HOST,
    },
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // No webServer — runs against an already-deployed instance.
});
