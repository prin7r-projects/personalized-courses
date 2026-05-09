import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { pathname } = req.nextUrl;

  // Public routes
  const publicPaths = [
    "/login",
    "/api/auth",
    "/api/healthz",
    "/api/intake/redeem",
    "/intake/",
  ];

  const isPublic = publicPaths.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // Protected: must be authenticated
  if (!req.auth?.user) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Operator-only routes
  if (
    pathname.startsWith("/api/operator") &&
    !(req.auth.user as any)?.isOperator
  ) {
    return NextResponse.json({ error: "operator access required" }, { status: 403 });
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
};
