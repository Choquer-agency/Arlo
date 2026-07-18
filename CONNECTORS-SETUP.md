# Connector setup checklist

Every OAuth connector needs an app registered on the provider's developer portal,
then its client ID/secret in env (Vercel + `.env.local`). API-key connectors
(MailerLite, Clarity) need nothing — users paste their key on /connections.

Env naming convention (enforced by `src/lib/mcp-context.ts`):
`<PROVIDER>_OAUTH_CLIENT_ID`, `<PROVIDER>_OAUTH_CLIENT_SECRET`, optional
`<PROVIDER>_OAUTH_REDIRECT_URI` (defaults to `<origin>/api/oauth/<provider>/callback`).

| Provider | Create app at | Redirect URI to register | Scopes to enable | Notes |
|---|---|---|---|---|
| Meta | developers.facebook.com (Business type) | `https://askarlo.app/api/oauth/meta/callback` | ads_read, read_insights, pages_show_list, pages_read_engagement, instagram_basic, instagram_manage_insights, business_management | Works instantly for app admins/testers; **App Review (Advanced Access)** needed for outside users. No refresh token — long-lived token ~60 days, then reconnect. Powers BOTH meta_ads and meta_organic. |
| HubSpot | developers.hubspot.com (app) | `https://askarlo.app/api/oauth/hubspot/callback` | crm.objects.contacts.read, crm.objects.deals.read, oauth | App's scope list must match exactly or the authorize screen 400s. |
| Salesforce | Setup → App Manager → New Connected App | `https://askarlo.app/api/oauth/salesforce/callback` | api, refresh_token/offline_access | Production orgs only (login.salesforce.com). instance_url is stored as the connection's accountId. |
| Mailchimp | mailchimp.com/developer (registered app) | `https://askarlo.app/api/oauth/mailchimp/callback` | (none — account-level) | Tokens never expire. Data-center (dc) stored as accountId. |
| Pipedrive | developers.pipedrive.com (marketplace app, can stay unlisted) | `https://askarlo.app/api/oauth/pipedrive/callback` | deals:read (default read scopes) | Token exchange + refresh use HTTP Basic auth (already wired). api_domain stored as accountId. |
| GoHighLevel | marketplace.gohighlevel.com (developer app) | `https://askarlo.app/api/oauth/gohighlevel/callback` | contacts.readonly, opportunities.readonly, calendars/events.readonly, locations.readonly | Location-level install (sub-account); locationId stored as accountId. |
| MailerLite | — (API key) | — | — | User pastes key from MailerLite → Integrations → API. |
| Microsoft Clarity | — (API token) | — | — | Token from Clarity project → Settings → Data export. **API only returns the last 1–3 days** (~10 req/day quota). |
| Google Tag Manager | — (rides the Google connection) | — | needs `https://www.googleapis.com/auth/tagmanager.readonly` | NOT yet requested by the Google OAuth (verification in flight). Enable later by adding the scope to `api/oauth/google/start` + the Cloud console scope list; until then the connector returns a clear "scope not enabled" error. |

For local dev, register a second redirect URI per provider with
`http://localhost:3000/...` (Meta requires https even in dev → use ngrok, same
as QuickBooks testing).

Client-side notes:
- meta_ads resolves the ad account from `client.metaAdAccountId`, else a single
  connected ad account, else asks the user to map one.
- Everything else is workspace-level (first/only account on the connection).
- All new connectors are `status: "beta"` and flow through the existing MCP
  tools (`marketing_query platform:"hubspot"` etc.) with no MCP changes.
