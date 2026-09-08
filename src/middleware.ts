import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/manifest.webmanifest", "/icon.svg", "/sw.js"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (
    PUBLIC_PATHS.some((path) => pathname === path) ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.startsWith("/api/auth")
  ) {
    return NextResponse.next();
  }

  const expectedToken = process.env.RUBA_STUDIO_SESSION_TOKEN || "ruba-studio-private";
  const sessionToken = request.cookies.get("ruba_session")?.value;

  if (sessionToken !== expectedToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!.*\\..*).*)", "/api/:path*"]
};
