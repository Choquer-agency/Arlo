import { NextResponse, type NextRequest } from "next/server";
import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isSignInPage = createRouteMatcher(["/sign-in", "/sign-up"]);
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/solo-dashboard(.*)",
  "/clients(.*)",
  "/connections(.*)",
  "/team(.*)",
  "/prompts(.*)",
  "/settings(.*)",
  "/onboarding",
]);

const convexConfigured = !!process.env.NEXT_PUBLIC_CONVEX_URL;

const convexMiddleware = convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const authed = await convexAuth.isAuthenticated();
  if (isSignInPage(request) && authed) {
    return nextjsMiddlewareRedirect(request, "/dashboard");
  }
  if (isProtectedRoute(request) && !authed) {
    return nextjsMiddlewareRedirect(request, "/sign-in");
  }
});

export default async function middleware(request: NextRequest, event: Parameters<typeof convexMiddleware>[1]) {
  if (!convexConfigured) {
    // Demo mode — let every route through so user can click around the site.
    return NextResponse.next();
  }
  return convexMiddleware(request, event);
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
