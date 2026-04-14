import { NextRequest, NextResponse } from "next/server";
import { decodeToken as jwtDecode } from "./lib/jwt";

interface JwtPayload {
  exp: number;
  role?: "user" | "technician" | "admin";
}

const PUBLIC_PATHS = ["/login", "/register", "/dashboard"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes
  if (PUBLIC_PATHS.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  const token = request.cookies.get("access_token")?.value;
  console.log("Middleware - Access Token:", token);

  if (!token) {
    return redirectToLogin(request);
  }

  try {
    const payload = jwtDecode(token);

    // Token expired
    if (payload.exp * 1000 < Date.now()) {
      return redirectToLogin(request);
    }

    // Role-based routing
    if (pathname.startsWith("/admin") && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    if (pathname.startsWith("/technician") && payload.role !== "technician") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  } catch {
    return redirectToLogin(request);
  }
}

function redirectToLogin(request: NextRequest) {
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("redirect", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/technician/:path*",
    "/admin/:path*",
  ],
};
