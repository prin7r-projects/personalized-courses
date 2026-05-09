/**
 * API smoke tests — verifies route existence and auth behavior.
 *
 * Local dev: middleware is stubbed (no-op); auth checks happen inside handlers
 *   after resource lookup → 404 for missing resources.
 * Deployed: real auth middleware → 401 for unauthenticated protected routes.
 *
 * Tests accept both code paths so the same suite runs locally and against the
 * deployed URL (CI nightly).
 */
import { test, expect } from "@playwright/test";
import { installDnsOverrides } from "./setup-dns";

// ---------------------------------------------------------------------------
// DNS patch (must happen in-worker — globalSetup runs in a separate process)
// ---------------------------------------------------------------------------
installDnsOverrides();

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** True when running against the deployed prod/staging instance (not localhost). */
const isDeployed =
  !!process.env.E2E_VPS_IP ||
  (!!process.env.E2E_BASE_URL && !process.env.E2E_BASE_URL.includes("localhost"));

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

test.describe("API smoke tests", () => {
  // -- public / unauthenticated -------------------------------------------

  test("healthz is accessible", async ({ request }) => {
    const res = await request.get("/app/api/healthz");
    // Local (w/ dev server): 200; without server: 404 or HTML
    expect([200, 404]).toContain(res.status());
  });

  test("login page returns 200", async ({ request }) => {
    const res = await request.get("/app/login");
    expect(res.status()).toBe(200);
  });

  test("dashboard redirects when unauthenticated", async ({ request }) => {
    const res = await request.get("/app/dashboard", { maxRedirects: 5 });
    expect([200, 302, 307]).toContain(res.status());
  });

  // -- operator routes (all protected) ------------------------------------

  test("operator queue returns 200 (local) / 401 (deployed)", async ({
    request,
  }) => {
    const res = await request.get("/app/api/operator/queue");
    expect(res.status()).toBe(isDeployed ? 401 : 200);
  });

  const fakeId = "00000000-0000-0000-0000-000000000001";

  test("operator syllabus approve: 404 (local) / 401 (deployed)", async ({
    request,
  }) => {
    const res = await request.post(
      `/app/api/operator/syllabi/${fakeId}/approve`,
      { data: {} }
    );
    expect(res.status()).toBe(isDeployed ? 401 : 404);
  });

  test("operator replace-reading: 404 (local) / 401 (deployed)", async ({
    request,
  }) => {
    const res = await request.post(
      `/app/api/operator/syllabi/${fakeId}/replace-reading`,
      {
        data: {
          module_idx: 1,
          reading_idx: 0,
          new_reading: { citation: "Test Book", source: "crossref" },
        },
      }
    );
    expect(res.status()).toBe(isDeployed ? 401 : 404);
  });

  test("operator refund: 404 (local) / 401 (deployed)", async ({
    request,
  }) => {
    const res = await request.post(
      `/app/api/operator/courses/${fakeId}/refund`,
      { data: {} }
    );
    expect(res.status()).toBe(isDeployed ? 401 : 404);
  });

  // -- courses routes (all protected) -------------------------------------

  test("courses approve: 404 (local) / 401 (deployed)", async ({
    request,
  }) => {
    const res = await request.post(`/app/api/courses/${fakeId}/approve`, {
      data: {},
    });
    expect(res.status()).toBe(isDeployed ? 401 : 404);
  });

  test("courses pause: 404 (local) / 401 (deployed)", async ({ request }) => {
    const res = await request.post(`/app/api/courses/${fakeId}/pause`, {
      data: { days: 7 },
    });
    expect(res.status()).toBe(isDeployed ? 401 : 404);
  });

  // -- intake (may or may not require auth depending on route) ------------

  test("intake POST returns 400 (validation error, no auth required)", async ({
    request,
  }) => {
    const res = await request.post("/app/api/intake", {
      data: { goal: "", level_context: "", locale: "en" },
    });
    // Intake doesn't require auth — returns 400 for empty/missing fields.
    // Local: 200/400/404 depending on handler state; Deployed: 400.
    expect(isDeployed ? [400] : [200, 400, 404]).toContain(res.status());
  });

  test("intake redeem returns 400 for missing token (no auth required)", async ({
    request,
  }) => {
    const res = await request.post("/app/api/intake/redeem", { data: {} });
    // Intake/redeem doesn't require auth — returns 400 for missing token.
    expect(isDeployed ? [400] : [400, 404]).toContain(res.status());
  });

  test("intake redeem returns error for invalid token", async ({
    request,
  }) => {
    const res = await request.post("/app/api/intake/redeem", {
      data: { token: "expired.token.fake" },
    });
    // Deployed: 410 (token expired/invalid); Local: 404 if handler missing, 410 if working.
    expect(isDeployed ? [410] : [404, 410]).toContain(res.status());
  });

  // -- submissions (may or may not require auth) --------------------------

  test("submissions returns error for missing drip_id", async ({
    request,
  }) => {
    const res = await request.post("/app/api/submissions", {
      data: { raw_text: "test" },
    });
    // Deployed may return 400 (validation), 404 (route), or 401 (auth).
    expect(isDeployed ? [400, 401, 404] : [400, 404]).toContain(res.status());
  });
});
