import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import { redirect } from "next/navigation";
import { api } from "../../../../convex/_generated/api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type SP = Record<string, string | string[] | undefined>;
const one = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-mint px-6 py-12">
      <div className="w-full max-w-md bg-white border border-dark-faded rounded-lg p-8 sm:p-10 shadow-sm">
        {children}
      </div>
      <p className="font-mono text-[11px] uppercase tracking-wider text-dark opacity-40 mt-6">
        askarlo.app · secure connection
      </p>
    </main>
  );
}

function ErrorCard({ title, detail }: { title: string; detail: string }) {
  return (
    <Shell>
      <h1 className="font-sans text-fluid-h4 text-dark mb-2">{title}</h1>
      <p className="text-dark opacity-70 text-fluid-main">{detail}</p>
    </Shell>
  );
}

/** Arlo mark (green) paired with the Claude wordmark to signal the connection. */
function LogoPair() {
  return (
    <div className="flex items-center justify-center gap-4 mb-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/arlo-icon-green.png"
        alt="ARLO"
        width={52}
        height={52}
        className="rounded-xl"
        style={{ imageRendering: "pixelated" }}
      />
      <div className="flex items-center gap-2 text-dark opacity-30">
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
        <span className="w-1.5 h-1.5 rounded-full bg-current" />
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/claude-logo.svg" alt="Claude" width={104} height={22} />
    </div>
  );
}

export default async function AuthorizeConsentPage({
  searchParams,
}: {
  searchParams: SP;
}) {
  const p = {
    responseType: one(searchParams.response_type),
    clientId: one(searchParams.client_id),
    redirectUri: one(searchParams.redirect_uri),
    codeChallenge: one(searchParams.code_challenge),
    codeChallengeMethod: one(searchParams.code_challenge_method),
    state: one(searchParams.state),
    scope: one(searchParams.scope),
  };

  if (!p.clientId || !p.redirectUri) {
    return <ErrorCard title="Authorization error" detail="Missing client_id or redirect_uri." />;
  }
  const client = await fetchQuery(api.oauth.getClient, { clientId: p.clientId });
  if (!client) {
    return <ErrorCard title="Unknown application" detail="This client_id is not registered." />;
  }
  if (!client.redirectUris.includes(p.redirectUri)) {
    return (
      <ErrorCard
        title="Authorization error"
        detail="The redirect URI is not registered for this application."
      />
    );
  }
  if (p.responseType !== "code" || p.codeChallengeMethod !== "S256" || !p.codeChallenge) {
    return (
      <ErrorCard
        title="Unsupported request"
        detail="This authorization request is missing PKCE (S256) or uses an unsupported response type."
      />
    );
  }

  // Require a signed-in Arlo user; bounce through sign-in and return here.
  const token = await convexAuthNextjsToken();
  if (!token) {
    const qs = new URLSearchParams({
      response_type: p.responseType,
      client_id: p.clientId,
      redirect_uri: p.redirectUri,
      code_challenge: p.codeChallenge,
      code_challenge_method: p.codeChallengeMethod,
      state: p.state,
      scope: p.scope,
    }).toString();
    redirect(`/sign-in?redirectTo=${encodeURIComponent(`/oauth/authorize?${qs}`)}`);
  }

  const workspaces = await fetchQuery(api.workspaces.listMine, {}, { token });
  const ws = workspaces[0];
  if (!ws) {
    return (
      <ErrorCard
        title="No workspace yet"
        detail="Finish onboarding in Arlo before connecting an application."
      />
    );
  }

  const appName = client.clientName || "An application";
  const denyUrl = (() => {
    const u = new URL(p.redirectUri);
    u.searchParams.set("error", "access_denied");
    if (p.state) u.searchParams.set("state", p.state);
    return u.toString();
  })();

  return (
    <Shell>
      <LogoPair />

      <h1 className="font-sans text-fluid-h3 text-dark mb-2 text-center">
        Connect to ARLO
      </h1>
      <p className="text-dark opacity-70 text-fluid-main text-center mb-6">
        <span className="text-dark opacity-100 font-medium">{appName}</span> wants to
        read your Arlo data on your behalf.
      </p>

      <div className="rounded-lg bg-mint border border-brand/15 p-4 mb-6">
        <p className="font-mono text-[11px] uppercase tracking-wider text-brand mb-1">
          Workspace
        </p>
        <p className="font-sans text-dark mb-3">{ws.name}</p>
        <ul className="space-y-1.5 text-sm text-dark opacity-70">
          <li className="flex gap-2">
            <span className="text-brand">✓</span> Read clients &amp; their connected platforms
          </li>
          <li className="flex gap-2">
            <span className="text-brand">✓</span> Query analytics scoped to your account only
          </li>
          <li className="flex gap-2">
            <span className="text-dark opacity-40">✕</span> No write access · you can revoke anytime
          </li>
        </ul>
      </div>

      <form method="post" action="/api/mcp/oauth/authorize">
        <input type="hidden" name="response_type" value={p.responseType} />
        <input type="hidden" name="client_id" value={p.clientId} />
        <input type="hidden" name="redirect_uri" value={p.redirectUri} />
        <input type="hidden" name="code_challenge" value={p.codeChallenge} />
        <input type="hidden" name="code_challenge_method" value={p.codeChallengeMethod} />
        <input type="hidden" name="state" value={p.state} />
        <input type="hidden" name="scope" value={p.scope} />
        <input type="hidden" name="workspace_id" value={ws._id} />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="btn-secondary flex-1 py-3 text-base font-medium"
          >
            Approve
          </button>
          <a
            href={denyUrl}
            className="px-5 py-3 text-dark opacity-60 hover:opacity-100 text-base"
          >
            Deny
          </a>
        </div>
      </form>
    </Shell>
  );
}
