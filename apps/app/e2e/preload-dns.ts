/**
 * Preload script: patches dns.lookup before any modules load.
 * Use with: NODE_OPTIONS="--require ./e2e/preload-dns.ts"
 *
 * Playwright's request fixture may use undici/fetch which doesn't
 * always go through dns.lookup. But this catches the cases that do.
 */
const dns = require("node:dns") as typeof import("node:dns");

const overrides: Record<string, string> = {
  "personalized-courses.prin7r.com": "144.91.94.91",
  "curriculum7.prin7r-app.com": "144.91.94.91",
};

// Allow env override
const raw = process.env.E2E_DNS_OVERRIDES;
if (raw) {
  try {
    Object.assign(overrides, JSON.parse(raw));
  } catch { /* keep defaults */ }
}

const originalLookup = dns.lookup;

(dns as any).lookup = function (
  hostname: string,
  arg2: any,
  arg3?: any
): void {
  const resolved = (overrides as Record<string, string>)[hostname];
  if (resolved) {
    if (typeof arg2 === "function") {
      return arg2(null, resolved, 4);
    }
    if (typeof arg3 === "function") {
      if (arg2 && arg2.all) {
        return arg3(null, [{ address: resolved, family: 4 }]);
      }
      return arg3(null, resolved, 4);
    }
  }
  if (typeof arg2 === "function") {
    return (originalLookup as any)(hostname, arg2);
  }
  return (originalLookup as any)(hostname, arg2, arg3);
};
