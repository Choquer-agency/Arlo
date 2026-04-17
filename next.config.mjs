/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    outputFileTracingIncludes: {
      "/*": ["./src/content/blog/posts/**/*.md"],
    },
  },
};

export default nextConfig;
