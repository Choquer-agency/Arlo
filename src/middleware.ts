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

const convexMiddleware = convexAuthNextjsMiddleware(
  async (request, { convexAuth }) => {
    const authed = await convexAuth.isAuthenticated();
    if (isSignInPage(request) && authed) {
      return nextjsMiddlewareRedirect(request, "/dashboard");
    }
    if (isProtectedRoute(request) && !authed) {
      return nextjsMiddlewareRedirect(request, "/sign-in");
    }
  },
  {
    // Convex Auth's middleware intercepts ANY request with a `?code=` query
    // param, tries to exchange it as a Convex Auth sign-in code, and on
    // failure redirects with the param stripped. Google's OAuth callback for
    // platform connections delivers its authorization code the same way, so
    // without this guard the middleware silently ate it ("Missing code or
    // state"). Only Convex Auth's own codes should be handled here.
    shouldHandleCode: (request) =>
      !request.nextUrl.pathname.startsWith("/api/oauth"),
  }
);

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
