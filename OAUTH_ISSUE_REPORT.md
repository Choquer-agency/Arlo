# Issue Report: Google OAuth "platform connection" flow silently drops the authorization `code`

> ## ✅ RESOLVED — root cause found (2026-07-03)
> It was never Google. **Convex Auth's Next.js middleware eats the `?code=` param.**
> `convexAuthNextjsMiddleware` intercepts any GET whose URL carries `?code=`
> (`node_modules/@convex-dev/auth/dist/nextjs/server/request.js` lines 16–41), tries to
> exchange it as a *Convex Auth* sign-in code via `auth:signIn`, and when that fails
> (it's a Google code) redirects to the same URL **with `code` deleted** and **clears
> auth cookies** — which is also why the user kept getting signed out after each attempt.
> The middleware matcher includes `/(api|trpc)(.*)`, so it ran on
> `/api/oauth/google/callback`. The `hd=` correlation was coincidental (all tested
> accounts were Workspace accounts); a consumer Gmail would have failed identically.
>
> **Fix (commit `634ecfe`):** pass `shouldHandleCode: (req) => !req.nextUrl.pathname.startsWith("/api/oauth")`
> as the second argument to `convexAuthNextjsMiddleware` in `src/middleware.ts`.
>
> Note: Google OAuth **verification** is still required eventually for external
> customers on sensitive scopes — but it was not the cause of this bug.

## TL;DR
A **second** Google OAuth flow (for connecting analytics data sources, *not* login) never
receives an authorization `code` back from Google. Google completes the consent screen, the
user clicks **Allow**, then redirects to our callback with `state`, `scope`, `iss`, `authuser`,
`hd`, `prompt` — but **no `code` and no `error`**. Our callback then errors with
`"Missing code or state"`.

**Login OAuth works. Data-connect OAuth fails.** Reproduced across **two independent Google
Workspaces** (`choquer.agency` and `pennicart.io`). Never yet tested a true consumer `@gmail.com`
(no `hd`). Current leading hypothesis: **Google blocks managed/Workspace accounts from granting
sensitive scopes to an unverified app**, and the admin-trust workaround is not holding.

---

## App / infra context
- **App:** Arlo — Next.js 14.2 (App Router) + Convex Auth (`@convex-dev/auth`).
- **Hosting:** Vercel project `arlo` (team `ollie-3652d4db`), custom domain **askarlo.app**,
  Git-connected to `github.com/Choquer-agency/Arlo`, deploys from `main`.
- **Convex deployment:** `dependable-echidna-662` (tagged `dev:` but currently serves prod).
  `SITE_URL` env is set to `https://askarlo.app`.
- **Single Google OAuth client used for BOTH flows:**
  `617433797836-p2a7qiasr5elgqdvaahgbfao5o3ija7p.apps.googleusercontent.com`
  (client secret is in `website/.env.local`, ends `…I-8F`).

## The two OAuth flows

### Flow A — Login (WORKS ✅)
- Driver: Convex Auth (`convex/auth.ts`, provider `@auth/core/providers/google`).
- Scopes: `openid email profile`.
- Redirect URI: `https://dependable-echidna-662.convex.site/api/auth/callback/google`.
- Result: returns `code`, session established. No problem.

### Flow B — Platform connection (FAILS ❌)
- Driver: custom Next.js route `src/app/api/oauth/google/start/route.ts` builds the authorize
  URL and 302s to Google; callback is `src/app/api/oauth/google/callback/route.ts`.
- Authorize params: `response_type=code`, `access_type=offline`, `prompt=consent`,
  `include_granted_scopes=true`.
- Scopes:
  `openid email profile`
  `https://www.googleapis.com/auth/analytics.readonly`
  `https://www.googleapis.com/auth/webmasters.readonly`
  `https://www.googleapis.com/auth/adwords`
  `https://www.googleapis.com/auth/youtube.readonly`
  `https://www.googleapis.com/auth/yt-analytics.readonly`
  `https://www.googleapis.com/auth/business.manage`
- Redirect URI: `https://askarlo.app/api/oauth/google/callback` (registered in the client).
- State: signed JWT via `src/lib/oauth-state.ts` (`signState`/`verifyState`).

## Exact failure signature
Google redirects to:
```
https://askarlo.app/api/oauth/google/callback
  ?state=<signed-jwt>
  &iss=https://accounts.google.com
  &scope=email profile openid .../userinfo.email .../userinfo.profile
         .../analytics.readonly .../webmasters.readonly .../adwords
         .../youtube.readonly .../yt-analytics.readonly .../business.manage
  &authuser=0
  &hd=choquer.agency
  &prompt=consent
```
Note: **no `code`, no `error`.** All requested scopes come back as granted. The callback route
checks `if (!code || !stateToken)` and returns HTTP 400 `"Missing code or state"` with a param dump.

Key nuance: the consent screen **does** render (granular per-scope list) and clicking **Allow**
succeeds — Google records the grant (the OAuth Overview showed "1 user / 100 cap") — yet the
redirect still carries no `code`.

## What has been RULED OUT (do not re-test these)
1. **App code / middleware** — `src/middleware.ts` matches `/(api|trpc)(.*)` so it runs on the
   callback, but it does not strip query params; the callback route executes and dumps Google's
   real params (which lack `code`). So Google is withholding the code, not our app.
2. **Redirect URI mismatch** — the flow returns to the exact registered URI; a mismatch would
   error *before* consent. Registered URIs include:
   `https://askarlo.app/api/oauth/google/callback`,
   `https://askarlo.app/api/auth/callback/google`,
   `https://dependable-echidna-662.convex.site/api/auth/callback/google`, plus localhost variants.
3. **Propagation delay** — waited 30+ minutes between admin changes and retries.
4. **Workspace API-control "Trusted"** — in Google Admin → Security → API controls → App access
   control, the app (`617433797836-…`) was set to **Trusted** for the **Choquer Creative** OU.
   `bryce@choquer.agency` is confirmed to be in the **Choquer Creative** OU (Directory → Users).
   Still drops the code.
5. **Test users** — added `bryce@choquer.agency` as a test user while in Testing mode. Still failed.
6. **Publishing status** — failed in **Testing** AND after **Publish to Production**. Currently
   "In production", User type "External", unverified.
7. **The two restricted-ish scopes** — a reduced-scope diagnostic (dropped `adwords` and
   `business.manage`, requested only `openid email profile analytics.readonly webmasters.readonly
   youtube.readonly yt-analytics.readonly`) reached the real granular consent screen, user clicked
   **Allow**, and it **still** dropped the code. So it is not those two scopes specifically.
8. **Single vs multiple orgs** — reproduced with `hd=choquer.agency` and `hd=pennicart.io` (two
   unrelated Workspaces). Rules out a single-org misconfiguration.

## NOT yet tested / open leads for the next session
1. **True consumer `@gmail.com`** (no `hd`) — the one account type never tested. Google's
   "Advanced → Continue (unsafe)" bypass for unverified apps only works for *consumer* accounts;
   both tested accounts were managed Workspaces. A Gmail success would prove the app+client are
   fine and localize the block to "managed accounts + unverified app + sensitive scopes." (User
   says they have no Gmail with Analytics data, but even a data-less Gmail would prove the `code`
   exchange works — the account picker would just show "no properties".)
2. **Are the underlying Google APIs enabled** in GCP project `617433797836`? Check that
   Analytics Data API, Analytics Admin API, Search Console API, Google Ads API, YouTube Data API,
   YouTube Analytics API, and Business Profile API are all enabled. (Unusual to cause a code-drop,
   but worth confirming.)
3. **Global Workspace setting** — Admin → Security → API controls → **Settings** →
   "unconfigured / unverified third-party apps" and "Internal apps" toggles. A global "block
   unverified apps" policy may override the per-app Trusted setting. Verify this for choquer.agency.
4. **Did External→Internal actually save/propagate?** A switch to **Internal** user type was
   attempted; confirm it took effect (Audience page) and retry — Internal apps are exempt from
   verification for same-org accounts and are the most likely admin-side unblock for
   choquer.agency's own data.
5. **Consider splitting OAuth clients.** `.env.example` implies login (client #1) and platform
   connections (client #2) should be **separate** Google clients; today they share one. A
   dedicated client for the sensitive-scope flow may behave differently and is cleaner for
   verification.
6. **Add server-side logging** to `callback/route.ts` (and confirm Convex Auth's
   `convexAuthNextjsMiddleware` isn't issuing a refresh redirect on `/api/oauth/google/callback`
   that could drop params). Log full request URL + headers to rule out a double-hit.

## Current leading hypothesis
Google prevents **managed (Google Workspace) accounts** from granting **sensitive scopes** to an
**unverified** app. This is enforced at Google's level; the per-org admin "Trusted" allowlist is
the intended override but is not taking effect here (possibly a global policy override, an
unsaved/ineffective setting, or an interaction we haven't isolated). The reliable, Google-
sanctioned fix is **OAuth app verification** (privacy policy — have it; scope justifications;
demo video). Verification is also *required* for the real user base (agencies/businesses are
overwhelmingly on Workspace).

## Relevant files
- `src/app/api/oauth/google/start/route.ts` — builds authorize URL (reads `GOOGLE_OAUTH_CLIENT_ID`,
  `GOOGLE_OAUTH_REDIRECT_URI`).
- `src/app/api/oauth/google/callback/route.ts` — token exchange; contains the `"Missing code or state"`
  branch and the `hd` hint.
- `src/middleware.ts` — Convex Auth middleware; matcher includes `/(api|trpc)(.*)`.
- `convex/auth.ts`, `convex/auth.config.ts` — Convex Auth (login flow).
- `src/lib/oauth-state.ts` — `signState`/`verifyState` (HMAC via `OAUTH_STATE_SECRET`).
- Vercel env on project `arlo` (Production): `GOOGLE_OAUTH_CLIENT_ID`, `GOOGLE_OAUTH_CLIENT_SECRET`,
  `GOOGLE_OAUTH_REDIRECT_URI=https://askarlo.app/api/oauth/google/callback` — all set/encrypted.

## Fastest paths to resolution
- **To unblock testing today:** try a true consumer `@gmail.com` (proves the plumbing), OR get
  External→Internal to actually apply for choquer.agency and reconnect with `bryce@choquer.agency`.
- **To unblock real customers (required):** submit the app for **Google OAuth verification**
  (scope justifications + demo video). This is the only path that lets arbitrary Workspace
  customers connect.
