// FIXME: middleware imports @/lib/auth → @/lib/db → postgres (Node 'stream')
// which crashes the edge runtime. Stubbed to no-op for deploy.
// Revisit with edge-compatible JWT-only auth check before Phase 6.
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(_req: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: [],
};
