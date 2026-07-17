import { google } from "googleapis";

export interface AvailableAccount {
  id: string;
  name: string;
  kind: string;
}

/**
 * Probe every Google data source the granted scopes allow and return the flat
 * list of accounts/properties/sites we can map to a client. Used both at OAuth
 * connect time (to cache the initial list) and by the "refresh list" action on
 * the Connections page — a user who just created a GA4 property re-runs this to
 * pick it up without re-authing.
 *
 * Each source is probed independently and failures are swallowed per-source so
 * one missing scope never blanks out the rest.
 */
export async function probeGoogleAccounts(accessToken: string): Promise<AvailableAccount[]> {
  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });

  const accounts: AvailableAccount[] = [];

  // GA4 properties — accountSummaries.list() returns every property the user
  // can see across all accounts in one call. (properties.list requires a
  // concrete account in its filter; the `parent:accounts/-` wildcard is
  // rejected, which silently yielded zero properties.)
  try {
    const admin = google.analyticsadmin({ version: "v1beta", auth: oauth2Client });
    let pageToken: string | undefined;
    do {
      const res = await admin.accountSummaries.list({ pageSize: 200, pageToken });
      for (const acct of res.data.accountSummaries ?? []) {
        for (const prop of acct.propertySummaries ?? []) {
          accounts.push({
            id: prop.property ?? "", // e.g. "properties/123456789"
            name: prop.displayName
              ? `${prop.displayName}${acct.displayName ? ` · ${acct.displayName}` : ""}`
              : prop.property ?? "",
            kind: "ga4_property",
          });
        }
      }
      pageToken = res.data.nextPageToken ?? undefined;
    } while (pageToken);
  } catch (e) {
    console.error("[google probe] ga4 accountSummaries.list failed:", e);
  }

  // GSC sites
  try {
    const sc = google.searchconsole({ version: "v1", auth: oauth2Client });
    const sites = await sc.sites.list();
    for (const s of sites.data.siteEntry ?? []) {
      accounts.push({
        id: s.siteUrl ?? "",
        name: s.siteUrl ?? "",
        kind: "gsc_site",
      });
    }
  } catch (e) {
    console.error("[google probe] gsc sites.list failed:", e);
  }

  // YouTube channels — paused while the youtube scopes are off the consent
  // screen (re-enable together with the scopes in api/oauth/google/start).
  // try {
  //   const yt = google.youtube({ version: "v3", auth: oauth2Client });
  //   const channels = await yt.channels.list({ part: ["id", "snippet"], mine: true });
  //   for (const c of channels.data.items ?? []) {
  //     accounts.push({
  //       id: c.id ?? "",
  //       name: c.snippet?.title ?? c.id ?? "",
  //       kind: "yt_channel",
  //     });
  //   }
  // } catch (e) {
  //   console.error("[google probe] youtube channels.list failed:", e);
  // }

  // GBP accounts + locations
  try {
    const gbpAccountsRes = await fetch(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    if (gbpAccountsRes.ok) {
      const body = (await gbpAccountsRes.json()) as {
        accounts?: { name: string; accountName?: string }[];
      };
      for (const a of body.accounts ?? []) {
        const locsRes = await fetch(
          `https://mybusinessbusinessinformation.googleapis.com/v1/${a.name}/locations?readMask=name,title,storefrontAddress&pageSize=100`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (locsRes.ok) {
          const locs = (await locsRes.json()) as {
            locations?: { name: string; title?: string }[];
          };
          for (const l of locs.locations ?? []) {
            accounts.push({
              id: l.name,
              name: l.title ?? l.name,
              kind: "gbp_location",
            });
          }
        } else {
          console.error(
            "[google probe] GBP locations failed:",
            locsRes.status,
            (await locsRes.text()).slice(0, 400)
          );
        }
      }
    } else {
      // Common cause: the Business Profile APIs aren't enabled in the Cloud
      // project, or their quota is 0 (must be requested from Google).
      console.error(
        "[google probe] GBP accounts failed:",
        gbpAccountsRes.status,
        (await gbpAccountsRes.text()).slice(0, 400)
      );
    }
  } catch (e) {
    console.error("[google probe] gbp accounts/locations failed:", e);
  }

  // Google Ads customers
  if (process.env.GOOGLE_ADS_DEVELOPER_TOKEN) {
    try {
      const adsRes = await fetch(
        "https://googleads.googleapis.com/v17/customers:listAccessibleCustomers",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "developer-token": process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
          },
        }
      );
      if (adsRes.ok) {
        const body = (await adsRes.json()) as { resourceNames?: string[] };
        for (const rn of body.resourceNames ?? []) {
          const id = rn.split("/")[1] ?? rn;
          accounts.push({ id, name: `Customer ${id}`, kind: "ads_customer" });
        }
      } else {
        // Common cause: the dev token is still in "test" access, so it can only
        // see test accounts (real ones return here), or the Ads API isn't enabled.
        console.error(
          "[google probe] Ads listAccessibleCustomers failed:",
          adsRes.status,
          (await adsRes.text()).slice(0, 500)
        );
      }
    } catch (e) {
      console.error("[google probe] Ads fetch threw:", e);
    }
  } else {
    console.error("[google probe] GOOGLE_ADS_DEVELOPER_TOKEN not set — skipping Ads.");
  }

  return accounts;
}
