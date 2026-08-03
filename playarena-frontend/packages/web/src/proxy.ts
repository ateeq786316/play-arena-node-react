import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const authPages = ["/login", "/signup", "/verify-otp", "/forgot-password", "/reset-password"];
const publicPages = ["/", ...authPages];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("accessToken")?.value;

  const isAuthPage = authPages.some((p) => pathname.startsWith(p));
  const isPublic = publicPages.some((p) => pathname === p) || pathname.startsWith("/_next") || pathname.startsWith("/api");

  if (!token && !isPublic) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (token && isAuthPage) {
    return NextResponse.redirect(new URL("/home", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
