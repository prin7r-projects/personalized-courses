/**
 * CI global setup: patches DNS so deployed URLs resolve to the VPS
 * even when public DNS is stale or missing.
 *
 * Overrides are read from E2E_DNS_OVERRIDES (JSON map of hostname→ip)
 * or default to the Curriculum7 VPS.
 */
import * as dns from "node:dns";

const DEFAULT_OVERRIDES: Record<string, string> = {
  "personalized-courses.prin7r.com": "144.91.94.91",
  "curriculum7.prin7r-app.com": "144.91.94.91",
};

function loadOverrides(): Record<string, string> {
  const raw = process.env.E2E_DNS_OVERRIDES;
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      console.warn("e2e/global-setup: invalid E2E_DNS_OVERRIDES, using defaults");
    }
  }
  return DEFAULT_OVERRIDES;
}

async function globalSetup() {
  const overrides = loadOverrides();
  if (Object.keys(overrides).length === 0) return;

  // eslint-disable-next-line @typescript-eslint/unbound-method
  const originalLookup: typeof dns.lookup = dns.lookup;

  // Patch dns.lookup — we use `as any` because the overloaded signatures
  // are painful to match exactly in TS.
  (dns as any).lookup = (
    hostname: string,
    arg2: any,
    arg3?: any
  ): void => {
    const resolved = overrides[hostname];
    if (resolved) {
      console.log(`[e2e DNS] ${hostname} → ${resolved}`);
      // Determine which overload was called
      if (typeof arg2 === "function") {
        // lookup(hostname, callback)
        return arg2(null, resolved, 4);
      }
      if (typeof arg3 === "function") {
        // lookup(hostname, options, callback)
        return arg3(null, resolved, 4);
      }
    }
    // Fall through to original
    if (typeof arg2 === "function") {
      return (originalLookup as any)(hostname, arg2);
    }
    return (originalLookup as any)(hostname, arg2, arg3);
  };

  console.log("[e2e DNS] overrides active:", overrides);
}

export default globalSetup;
