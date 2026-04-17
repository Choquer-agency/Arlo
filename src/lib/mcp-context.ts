/**
 * Build a ConnectorContext for an MCP call. Handles OAuth token refresh and
 * pulls the PlatformConnection record(s) the connector needs.
 */
import { fetchQuery, fetchMutation } from "convex/nextjs";
import { api } from "../../convex/_generated/api";
import type { Doc, Id } from "../../convex/_generated/dataModel";
import { decryptCredentials, encryptCredentials } from "./crypto";
import type { ConnectorContext, OAuthProvider } from "./connectors/types";
import { getServiceSecret } from "./serviceSecret";

const REFRESH_ENDPOINTS: Record<OAuthProvider, string> = {
  google: "https://oauth2.googleapis.com/token",
  meta: "https://graph.facebook.com/v19.0/oauth/access_token",
  linkedin: "https://www.linkedin.com/oauth/v2/accessToken",
  tiktok: "https://business-api.tiktok.com/open_api/v1.3/oauth2/refresh_token/",
  shopify: "",
  stripe: "https://connect.stripe.com/oauth/token",
  hubspot: "https://api.hubapi.com/oauth/v1/token",
  mailerlite: "",
  mailchimp: "https://login.mailchimp.com/oauth2/token",
};

function clientEnv(provider: OAuthProvider): { id: string; secret: string } {
  const id = process.env[`${provider.toUpperCase()}_OAUTH_CLIENT_ID`];
  const secret = process.env[`${provider.toUpperCase()}_OAUTH_CLIENT_SECRET`];
  if (!id || !secret) {
    throw new Error(`Missing ${provider.toUpperCase()}_OAUTH_CLIENT_ID / _SECRET env vars`);
  }
  return { id, secret };
}

async function refreshProviderToken(
  provider: OAuthProvider,
  connection: Doc<"platformConnections">
): Promise<string> {
  const url = REFRESH_ENDPOINTS[provider];
  if (!url) throw new Error(`Token refresh not supported for ${provider}`);
  const creds = JSON.parse(decryptCredentials(connection.encryptedTokens, connection.tokensIv));
  const { id, secret } = clientEnv(provider);

  const body = new URLSearchParams({
    client_id: id,
    client_secret: secret,
    grant_type: "refresh_token",
    refresh_token: creds.refreshToken,
  });

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Refresh failed for ${provider}: ${text}`);
  }
  const json = (await res.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in?: number;
  };

  const newCreds = {
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? creds.refreshToken,
  };
  const { ciphertext, iv } = encryptCredentials(JSON.stringify(newCreds));
  const newExpires = json.expires_in ? Date.now() + json.expires_in * 1000 : undefined;

  await fetchMutation(api.platformConnections.updateTokens, {
    _serviceSecret: getServiceSecret(),
    connectionId: connection._id,
    encryptedTokens: ciphertext,
    tokensIv: iv,
    tokenExpiresAt: newExpires,
  });

  return json.access_token;
}

export async function buildConnectorContext(
  workspaceId: Id<"workspaces">,
  client: Doc<"clients">
): Promise<ConnectorContext> {
  const getConnection = async (provider: OAuthProvider, accountId?: string) => {
    const conn = await fetchQuery(api.platformConnections.getByProvider, {
      workspaceId,
      provider,
    });
    if (!conn) return null;
    if (accountId && conn.accountId && conn.accountId !== accountId) return null;
    return conn;
  };

  const getAccessToken = async (provider: OAuthProvider, accountId?: string): Promise<string> => {
    const conn = await getConnection(provider, accountId);
    if (!conn) {
      throw new Error(
        `No ${provider} connection for this workspace. Connect it on the Connections page.`
      );
    }
    const creds = JSON.parse(decryptCredentials(conn.encryptedTokens, conn.tokensIv));
    const expiresAt = conn.tokenExpiresAt ?? 0;
    if (expiresAt - Date.now() > 60_000 && creds.accessToken) {
      return creds.accessToken;
    }
    return refreshProviderToken(provider, conn);
  };

  return { workspaceId, client, getAccessToken, getConnection };
}
