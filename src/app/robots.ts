import { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/siteConfig";

export default function robots(): MetadataRoute.Robots {
  // App / auth / demo / token routes carry no SEO value and shouldn't be
  // indexed (also enforced with an X-Robots-Tag: noindex header in next.config).
  const disallow = [
    "/api/",
    "/sign-in",
    "/welcome",
    "/onboarding",
    "/oauth/",
    "/dashboard",
    "/solo-dashboard",
    "/clients",
    "/connections",
    "/team",
    "/settings/",
    "/demo/",
    "/preview/",
    "/share/",
  ];

  return {
    rules: [
      { userAgent: "*", allow: "/", disallow },
      // OpenAI crawlers
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      // Anthropic crawlers
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-SearchBot", allow: "/" },
      // Perplexity crawlers
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Perplexity-User", allow: "/" },
      // Google AI crawlers
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "GoogleOther", allow: "/" },
      // Other AI crawlers
      { userAgent: "Applebot-Extended", allow: "/" },
      { userAgent: "Amazonbot", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "DeepSeekBot", allow: "/" },
      { userAgent: "DuckAssistBot", allow: "/" },
      { userAgent: "YouBot", allow: "/" },
      { userAgent: "PhindBot", allow: "/" },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
