/**
 * DNS resolution override for use inside Playwright test workers.
 *
 * Import this at the top of each spec file (or in a custom fixture) to
 * redirect hostnames when public DNS is stale or missing.
 *
 * Controlled by E2E_DNS_OVERRIDES (JSON map hostname→ip) with built-in
 * defaults for Curriculum7 domains.
 */
import * as dns from "node:dns";

const DEFAULT_OVERRIDES: Record<string, string> = {
  "personalized-courses.prin7r.com": "144.91.94.91",
  "curriculum7.prin7r-app.com": "144.91.94.91",
};

let installed = false;

interface LookupOptions {
  family?: number;
  hints?: number;
  all?: boolean;
  verbatim?: boolean;
}

function loadOverrides(): Record<string, string> {
  const raw = process.env.E2E_DNS_OVERRIDES;
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch {
      console.warn("e2e/setup-dns: invalid E2E_DNS_OVERRIDES, using defaults");
    }
  }
  return DEFAULT_OVERRIDES;
}

export function installDnsOverrides() {
  if (installed) return;
  installed = true;

  const overrides = loadOverrides();
  if (Object.keys(overrides).length === 0) return;

  const originalLookup: typeof dns.lookup = dns.lookup;

  (dns as any).lookup = (
    hostname: string,
    arg2: LookupOptions | dns.LookupCallback,
    arg3?: dns.LookupCallback
  ): void => {
    const resolved = overrides[hostname];
    if (resolved) {
      if (typeof arg2 === "function") {
        // lookup(hostname, callback)
        return arg2(null, resolved, 4);
      }
      if (typeof arg3 === "function") {
        // lookup(hostname, options, callback)
        if ((arg2 as LookupOptions).all) {
          // all:true → callback expects array of {address, family}
          return arg3(null, [{ address: resolved, family: 4 }]);
        }
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
