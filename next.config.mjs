/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/*": ["./src/content/blog/posts/**/*.md"],
      "/arlo": ["./src/app/arlo/page.html"],
    },
  },
  async headers() {
    // Reliably de-index app/auth/demo/token routes (robots.txt disallow only
    // prevents crawl, not indexing of externally-linked URLs).
    const noindex = [
      "/sign-in",
      "/welcome",
      "/onboarding",
      "/oauth/:path*",
      "/dashboard/:path*",
      "/solo-dashboard/:path*",
      "/clients/:path*",
      "/connections/:path*",
      "/team/:path*",
      "/settings/:path*",
      "/demo/:path*",
      "/preview/:path*",
      "/share/:path*",
    ];
    const noindexHeaders = noindex.map((source) => ({
      source,
      headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
    }));

    // Site-wide security headers (audits/technical.md, README.md P1 #14).
    // Additive only — no CSP here, since a Content-Security-Policy needs
    // live testing against every third-party script (GTM, Convex) this
    // sandbox can't do; scoped to headers that are safe by construction.
    const securityHeaders = [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];

    return [...securityHeaders, ...noindexHeaders];
  },
  async rewrites() {
    return [
      // MCP OAuth discovery (RFC 9728 / 8414). Served from normal route
      // handlers to avoid Next's dot-folder handling of /.well-known.
      // The `:path*` variants cover the resource-path-suffixed form clients
      // use (e.g. /.well-known/oauth-protected-resource/api/mcp).
      {
        source: "/.well-known/oauth-protected-resource",
        destination: "/api/mcp/oauth/metadata/protected-resource",
      },
      {
        source: "/.well-known/oauth-protected-resource/:path*",
        destination: "/api/mcp/oauth/metadata/protected-resource",
      },
      {
        source: "/.well-known/oauth-authorization-server",
        destination: "/api/mcp/oauth/metadata/authorization-server",
      },
      {
        source: "/.well-known/oauth-authorization-server/:path*",
        destination: "/api/mcp/oauth/metadata/authorization-server",
      },
    ];
  },
};

export default nextConfig;
