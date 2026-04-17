export const AGENCY_NAME = "ARLO";
export const SITE_URL = "https://askarlo.app";
export const CONTACT_EMAIL = "hello@askarlo.app";
export const PHONE = "+17782374700";

export const siteConfig = {
  name: AGENCY_NAME,
  url: SITE_URL,
  email: CONTACT_EMAIL,
  phone: PHONE,
  tagline: "Ask Claude about any client, any platform.",
  description:
    "ARLO plugs Claude into every account your agency runs. One connector, every client, every platform — GA4, Search Console, Google Ads, Meta, YouTube, Shopify, and more. Live data, not exports.",
  founder: "Bryce Choquer",
  location: "Canada",
  social: {
    linkedin: "https://linkedin.com/company/askarlo",
    twitter: "https://x.com/askarlo",
    github: "https://github.com/askarlo",
  },
  gtmId: process.env.NEXT_PUBLIC_GTM_ID || "",
};
