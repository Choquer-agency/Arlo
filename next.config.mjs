/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingIncludes: {
    "/*": ["./src/content/blog/posts/**/*.md"],
  },
};

export default nextConfig;
